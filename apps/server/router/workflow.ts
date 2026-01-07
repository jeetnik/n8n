import { Router } from "express";
import type { Request, Response } from "express";
import { WorkflowSchema } from "../utils/types";
import { prisma } from "db";
const workflowRouter = Router();

workflowRouter.post("/save", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const parsed = WorkflowSchema.parse(payload);
    const savedWorkflow = await prisma.workflow.create({
      data: {
        name: parsed.name,
        active: parsed.active,
        nodes: parsed.nodes as any,
        edges: parsed.edges as any,
        userId: req.user?.id,
        tags: [],
      },
    });
    const saveddata={
        workflowId: savedWorkflow.id,
        name: savedWorkflow.name,
        active: savedWorkflow.active,
        createdAt: savedWorkflow.createdAt,
    }
    console.log("workflow is saved",savedWorkflow.id);
    res.status(200).json({
      message:"Workflow is save",
      data:saveddata
    })

  } catch (error) {

    res.status(500).json({
      message :"failed to save workflow"
    })
  }
});


workflowRouter.get('/:workflowId',async (req:Request,res:Response)=>{  
  
  try{
    const workflowId=req.params;
     const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: req.user?.id,
      },
    });
    if(!workflow){
      return res.status(404).json({
        message:"workflow not found"
      })
    }
     const workflowData = {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      nodes: workflow.nodes,
      edges: workflow.edges,
      tags: workflow.tags,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };
    res.status(200).json({
      message:"workflow recived",
      data:workflowData
    })
  }catch(error){
    res.status(500).json({
      message:"Failed to retrieve workflow"
    })

}

})

workflowRouter.put('/:workflowId',async(req:Request,res:Response)=>{
try{
   const { workflowId } = req.params;
  const payload = req.body;

  const parsed = WorkflowSchema.parse(payload);
    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id: workflowId,
        userId: req.user?.id,
      },
      data: {
        name: parsed.name,
        active: parsed.active,
        nodes: parsed.nodes,
        edges: parsed.edges,
        updatedAt: new Date(),
      },
    });
    const updatedData={
       workflowId: updatedWorkflow.id,
        name: updatedWorkflow.name,
        active: updatedWorkflow.active,
        updatedAt: updatedWorkflow.updatedAt,
    }
    res.status(200).json({
      message:"workflow updated successfully!",
      data:updatedData,
    })
}catch(error:any){
  if(error.code=="P2025"){
    return res.status(404).json({
      message:"Workflow not found",
    })
  }
  res.status(500).json({
    message:"Failed to update the workflow"
  })

}
})


workflowRouter.delete('/:workflowId',async (req:Request,res:Response)=>{
    const userId = req.user.id;
  const {workflowId} = req.params
  if( !userId) return res.status(404).json({
  messgae:  "userid not found"
  })
    let delWf;
    try {
       delWf = await prisma.workflow.delete({
        where:{
          id: workflowId
        }
      })

    } catch (error) {
      return res.status(400).json({message:"failed to delete the workflow"})
    }

    res.status(200).json({message: "Workflow deleted successfully", delWf})

})