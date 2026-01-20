import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "db";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
import { workflowQueue } from "../utils/queue";

const webhookRouter = Router();

const publisherRedis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

const connectRedis = async () => {
  try {
    await publisherRedis.connect();
  } catch (error) {
    console.log("redis cannot connect", error);
  }
};
connectRedis();

// Trigger webhook
webhookRouter.post("/:workflowId/:nodeId", async (req: Request, res: Response) => {
  try {
    const { workflowId, nodeId } = req.params;
    const webhookPayload = req.body;
    const queryParams = req.query;

    console.log(`webhook triggered: ${workflowId}/${nodeId}`);
    console.log("payload:", webhookPayload);

    let workflow;
    try {
      workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
        },
      });
    } catch (error) {
      console.error("error in finding the workflow:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: "Workflow not found or inactive",
      });
    }

    const hasWebhookNode =
      workflow.nodes && Array.isArray(workflow.nodes)
        ? workflow.nodes.some(
          (node: any) =>
            node &&
            typeof node === "object" &&
            node.id === nodeId &&
            node.type === "webhookTrigger"
        )
        : false;

    if (!hasWebhookNode) {
      return res.status(404).json({
        success: false,
        error: "Webhook trigger node not found in workflow",
      });
    }

    const executionId = uuidv4();

    const executionJob = {
      executionId,
      workflowId,
      userId: workflow.userId,
      triggeredBy: "webhook",
      triggeredAt: new Date().toISOString(),
      triggerData: {
        nodeId,
        webhookPayload,
        queryParams,
        headers: {
          "user-agent": req.headers["user-agent"],
          "content-type": req.headers["content-type"],
        },
        method: req.method,
        ip: req.ip,
      },
      workflow: {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        active: workflow.active,
      },
      status: "queued",
      priority: "high",
    };

    await workflowQueue.add("execute-workflow", executionJob, {
      jobId: executionId,
      priority: 1,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });

    await publisherRedis.hSet(`execution:${executionId}`, {
      status: "queued",
      triggeredBy: "webhook",
      workflowId: workflowId || "",
      nodeId: nodeId || "",
      userId: workflow.userId,
      createdAt: new Date().toISOString(),
    });

    await publisherRedis.expire(`execution:${executionId}`, 86400);

    console.log(`Webhook execution queued: ${executionId}`);

    return res.status(200).json({
      success: true,
      message: "Webhook received and workflow execution queued",
      executionId,
      workflowId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process webhook trigger",
    });
  }
});

// Also support GET method for webhooks
webhookRouter.get("/:workflowId/:nodeId", async (req: Request, res: Response) => {
  try {
    const { workflowId, nodeId } = req.params;
    const queryParams = req.query;

    console.log(`webhook triggered (GET): ${workflowId}/${nodeId}`);

    let workflow;
    try {
      workflow = await prisma.workflow.findFirst({
        where: {
          id: workflowId,
        },
      });
    } catch (error) {
      console.error("error in finding the workflow:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: "Workflow not found or inactive",
      });
    }

    const hasWebhookNode =
      workflow.nodes && Array.isArray(workflow.nodes)
        ? workflow.nodes.some(
          (node: any) =>
            node &&
            typeof node === "object" &&
            node.id === nodeId &&
            node.type === "webhookTrigger"
        )
        : false;

    if (!hasWebhookNode) {
      return res.status(404).json({
        success: false,
        error: "Webhook trigger node not found in workflow",
      });
    }

    const executionId = uuidv4();

    const executionJob = {
      executionId,
      workflowId,
      userId: workflow.userId,
      triggeredBy: "webhook",
      triggeredAt: new Date().toISOString(),
      triggerData: {
        nodeId,
        webhookPayload: {},
        queryParams,
        headers: {
          "user-agent": req.headers["user-agent"],
          "content-type": req.headers["content-type"],
        },
        method: req.method,
        ip: req.ip,
      },
      workflow: {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
        active: workflow.active,
      },
      status: "queued",
      priority: "high",
    };

    await workflowQueue.add("execute-workflow", executionJob, {
      jobId: executionId,
      priority: 1,
      removeOnComplete: 1000,
      removeOnFail: 5000,
    });

    await publisherRedis.hSet(`execution:${executionId}`, {
      status: "queued",
      triggeredBy: "webhook",
      workflowId: workflowId || "",
      nodeId: nodeId || "",
      userId: workflow.userId,
      createdAt: new Date().toISOString(),
    });

    await publisherRedis.expire(`execution:${executionId}`, 86400);

    console.log(`Webhook execution queued (GET): ${executionId}`);

    return res.status(200).json({
      success: true,
      message: "Webhook received and workflow execution queued",
      executionId,
      workflowId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process webhook trigger",
    });
  }
});

export default webhookRouter;
