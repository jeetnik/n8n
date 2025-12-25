import { Router } from "express";
import auth from "../middelware/auth";
import { prisma } from "db";

export const workflowRouter=Router();

workflowRouter.post("/create",auth,async (req,res)=>{
    try{

    const {id} =req.user!;
    const {name}=req.body;

    if(!name || typeof name !== "string"){
        return res.status(400).json({
           message:"name of workflow is required" 
        })
    }

    const workflowData=await prisma.workflow.create({
        data:{
            name:name,
            userId:id
        }
    })
    return res.status(201).json({
        message:"workflow is created",
        workflowData
    })
   
    }catch(e){
        console.error(e);
        return res.status(500).json({
          message: "Internal server error"
        });

    }
})