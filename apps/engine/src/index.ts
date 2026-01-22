import { Workflow } from "./workers/workflow";
import { Worker } from "bullmq";
import { scheduleService } from "./services/scheduleService";
import { createAIWorker } from "./workers/ai-worker";
import { prisma } from "db";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisConfig = new URL(redisUrl);

const worker = new Worker(
  "workflow-execution",
  async (job) => {
    const start = Date.now();
    const exectionData = job.data;

    try {
      await prisma.workflowExecution.create({
        data: {
          id: exectionData.executionId,
          workflowId: exectionData.workflow.id,
          workflowName: exectionData.workflow.name,
          userId: exectionData.userId,
          status: "RUNNING",
          triggeredBy: exectionData.triggeredBy,
          metadata: exectionData.metadata || {},
          nodeResults: [],
        },
      });

      console.log("Starting workflow execution", {
        workflowId: exectionData.workflow.id,
        workflowName: exectionData.workflow.name,
        triggeredBy: exectionData.triggeredBy,
      });

      const workflowObj = new Workflow(exectionData);

      workflowObj.buildGraph();
      if (workflowObj.detectCycle()) {
        console.error("Cycle detected in workflow", { workflowId: exectionData.workflow.id });
        return;
      }
      workflowObj.getExecutionOrder();

      console.log("Executing workflow", { workflowId: exectionData.workflow.id });
      await workflowObj.execute();

      const duration = Date.now() - start;

      await prisma.workflowExecution.update({
        where: { id: exectionData.executionId },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          duration: duration,
          nodeResults: Array.from(workflowObj.nodeOutputs.entries()).map(([nodeId, output]) => ({
            nodeId,
            status: "completed",
            output,
            executedAt: new Date(),
          })),
        },
      });

      console.log("Workflow execution completed", {
        workflowId: exectionData.workflow.id,
        duration: duration / 1000
      });
    } catch (error: any) {
      try {
        await prisma.workflowExecution.update({
          where: { id: exectionData.executionId },
          data: {
            status: "FAILED",
            finishedAt: new Date(),
            duration: Date.now() - start,
            error: error.message || String(error),
          },
        });
      } catch (dbError) {
        console.error("Failed to update execution record", { error: dbError });
      }

      console.error("Workflow execution failed", {
        workflowId: exectionData.workflow.id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
  {
    connection: {
      host: redisConfig.hostname,
      port: parseInt(redisConfig.port) || 6379,
    },
  }
);

worker.on("completed", (job) => {
  console.log("Job completed", { jobId: job.id });
});

worker.on("failed", (job, err) => {
  console.error("Job failed", { jobId: job?.id, error: err.message });
});

const aiWorker = createAIWorker({
  host: redisConfig.hostname,
  port: parseInt(redisConfig.port) || 6379,
});

console.log("AI worker started");

scheduleService.initialize().catch((error) => {
  console.error("Failed to initialize schedule service:", error);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  scheduleService.shutdown();
  worker.close();
  aiWorker.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...");
  scheduleService.shutdown();
  worker.close();
  aiWorker.close();
  process.exit(0);
});

console.log("Workflow engine worker started");
