import { Router } from "express";
import type { Request, Response } from "express";
import { WorkflowSchema } from "../utils/workflowSchema";
import { prisma } from "db";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { workflowQueue } from "../utils/queue";
import { isLoggedIn } from "../middelware/auth";

const workflowRouter = Router();

const publisherRedis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

const connectRedis = async () => {
  try {
    await publisherRedis.connect();
    console.log("Redis connected successfully");
  } catch (error) {
    console.error("Redis connection failed", { error });
  }
};
connectRedis();

// Save workflow (create)
workflowRouter.post("/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const parsed = WorkflowSchema.parse(payload);

    const savedWorkflow = await prisma.workflow.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        active: parsed.active,
        nodes: parsed.nodes,
        edges: parsed.edges,
        userId: req.user?.id,
        tags: [],
      },
    });

    console.log("Workflow saved successfully", {
      workflowId: savedWorkflow.id,
      userId: req.user?.id,
    });

    try {
      await publisherRedis.publish(
        "workflow:schedule:refresh",
        JSON.stringify({ workflowId: savedWorkflow.id })
      );
    } catch (error) {
      console.warn("Failed to publish schedule refresh event", { error, workflowId: savedWorkflow.id });
    }

    return res.status(201).json({
      statusCode: 201,
      message: "workflow created successfully",
      data: {
        workflowId: savedWorkflow.id,
        name: savedWorkflow.name,
        active: savedWorkflow.active,
        createdAt: savedWorkflow.createdAt,
      },
    });
  } catch (error) {
    console.error("Error saving workflow", { error, userId: req.user?.id });
    return res.status(500).json({
      statusCode: 500,
      message: "failed to save workflow",
      data: null,
    });
  }
});

// Get workflow by ID
workflowRouter.get("/:workflowId", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: req.user?.id,
      },
    });

    if (!workflow) {
      return res.status(404).json({
        statusCode: 404,
        message: "wf not found",
        data: null,
      });
    }

    const workflowData = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      active: workflow.active,
      nodes: workflow.nodes,
      edges: workflow.edges,
      tags: workflow.tags,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    };

    return res.status(200).json({
      statusCode: 200,
      message: "wf retrieved successfully",
      data: workflowData,
    });
  } catch (error) {
    console.error("Error retrieving wf:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to retrieve workflow",
      data: null,
    });
  }
});

// Update workflow
workflowRouter.put("/:workflowId", isLoggedIn, async (req: Request, res: Response) => {
  try {
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
        description: parsed.description,
        active: parsed.active,
        nodes: parsed.nodes,
        edges: parsed.edges,
        updatedAt: new Date(),
      },
    });

    console.log("Workflow updated successfully:", updatedWorkflow.id);

    try {
      await publisherRedis.publish(
        "workflow:schedule:refresh",
        JSON.stringify({ workflowId: updatedWorkflow.id })
      );
    } catch (error) {
      console.warn("Failed to publish schedule refresh event", { error, workflowId });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Workflow updated successfully",
      data: {
        workflowId: updatedWorkflow.id,
        name: updatedWorkflow.name,
        active: updatedWorkflow.active,
        updatedAt: updatedWorkflow.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error updating workflow:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        statusCode: 404,
        message: "Workflow not found",
        data: null,
      });
    }

    return res.status(500).json({
      statusCode: 500,
      message: "Failed to update workflow",
      data: null,
    });
  }
});

// Get all user workflows
workflowRouter.get("/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: {
        userId: req.user?.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        active: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        nodes: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Workflows retrieved successfully",
      data: workflows,
    });
  } catch (error) {
    console.error("Error retrieving workflows:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to retrieve workflows",
      data: null,
    });
  }
});

// Execute workflow
workflowRouter.post("/:workflowId/execute", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;

    if (!userId) {
      return res.status(404).json({
        message: "userId Not Found invalid token",
      });
    }

    if (!workflowId) {
      return res.status(404).json({
        message: "workflow id not found",
      });
    }

    let workflow;
    try {
      workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
          userId: userId,
        },
      });
    } catch (error) {
      return res.status(401).json({
        message: "Error in getting workflow",
      });
    }

    if (!workflow) {
      return res.status(404).json({
        message: "Workflow does not exist",
      });
    }

    console.log("Workflow==>", workflow);

    const executionId = uuidv4();

    const executionJob = {
      executionId: executionId,
      workflowId: workflow.id,
      userId: userId,
      triggeredBy: "manual",
      triggeredAt: new Date().toISOString(),
      workflow: {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        active: workflow.active,
      },
      status: "queued",
      priority: "normal",
      metadata: {
        source: "api",
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      },
    };

    await workflowQueue.add("execute-workflow", executionJob, {
      jobId: executionId,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });

    await publisherRedis.hSet(`execution:${executionId}`, {
      status: "queued",
      createdAt: new Date().toISOString(),
      workflowId: workflowId,
      userId: userId,
    });

    await publisherRedis.expire(`execution:${executionId}`, 86400);

    console.log(
      `Workflow ${workflowId} queued for execution with ID: ${executionId}`
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Workflow queued for execution successfully",
      data: {
        executionId: executionId,
        workflowId: workflowId,
        status: "queued",
        estimatedStartTime: "within 30 seconds",
      },
    });
  } catch (error) {
    console.error("Error queuing workflow for execution:", error);
    return res.status(500).json({
      message: "Failed to queue workflow for execution",
    });
  }
});

// Delete workflow (soft delete)
workflowRouter.delete("/:workflowId", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { workflowId } = req.params;

    if (!userId) {
      return res.status(404).json({
        message: "userid not found",
      });
    }

    const delWf = await prisma.workflow.update({
      where: {
        id: workflowId,
        userId: userId,
      },
      data: {
        deletedAt: new Date(),
        active: false,
      },
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Workflow deleted successfully",
      data: delWf,
    });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return res.status(400).json({
      message: "failed to delete the workflow",
    });
  }
});

export default workflowRouter;
