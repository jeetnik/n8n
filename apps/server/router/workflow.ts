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
