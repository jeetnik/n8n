import * as cron from "node-cron";
import { prisma } from "db";
import { workflowQueue } from "./queue";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";

interface ScheduledJob {
    workflowId: string;
    nodeId: string;
    cronExpression: string;
    task: cron.ScheduledTask;
}

class ScheduleService {
    private scheduledJobs: Map<string, ScheduledJob> = new Map();
    private subscriber = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

    constructor() {
        setInterval(() => {
            console.log(`[ScheduleService Heartbeat] Active jobs: ${this.scheduledJobs.size}`);
            this.scheduledJobs.forEach((job, key) => {
                console.log(`- Job ${key}: ${job.cronExpression}`);
            });
        }, 60000);
    }

    async initialize() {
        console.log("Initializing schedule service...");

        await this.subscriber.connect();

        await this.subscriber.subscribe("workflow:schedule:refresh", (message) => {
            try {
                const { workflowId } = JSON.parse(message);
                console.log(`Received schedule refresh request for workflow ${workflowId}`);
                this.refreshWorkflowSchedules(workflowId);
            } catch (error) {
                console.error("Error processing schedule refresh message:", error);
            }
        });

        await this.loadActiveSchedules();
        console.log(`Schedule service initialized with ${this.scheduledJobs.size} active schedules`);
    }

    private async loadActiveSchedules() {
        try {
            const activeWorkflows = await prisma.workflow.findMany({
                where: { active: true },
            });

            console.log(`Found ${activeWorkflows.length} active workflows to check for schedules`);

            for (const workflow of activeWorkflows) {
                const nodes = workflow.nodes as unknown as Array<{ id: string; type: string; data?: Record<string, unknown> }>;
                const scheduleTriggers = nodes.filter(
                    (node) => node.type === "scheduleTrigger"
                );

                for (const trigger of scheduleTriggers) {
                    if (trigger.data && typeof trigger.data.cronExpression === 'string') {
                        this.scheduleWorkflow(
                            workflow.id,
                            trigger.id,
                            trigger.data.cronExpression,
                            workflow.userId
                        );
                    } else {
                        console.warn(`Trigger ${trigger.id} in workflow ${workflow.id} missing cronExpression. Data: ${JSON.stringify(trigger.data)}`);
                    }
                }
            }
        } catch (error: any) {
            console.error("Error loading active schedules:", error);
        }
    }

    scheduleWorkflow(
        workflowId: string,
        nodeId: string,
        cronExpression: string,
        userId: string
    ) {
        const jobKey = `${workflowId}-${nodeId}`;

        if (this.scheduledJobs.has(jobKey)) {
            console.warn(`Schedule already exists for ${jobKey}, removing old schedule`);
            this.unscheduleWorkflow(workflowId, nodeId);
        }

        if (!cron.validate(cronExpression)) {
            console.error(`Invalid cron expression: ${cronExpression} for workflow ${workflowId}`);
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }

        console.log(`Creating cron schedule for workflow ${workflowId} with expression: ${cronExpression}`);

        const task = cron.schedule(
            cronExpression,
            async (context) => {
                try {
                    console.log(`[CRON TICK] Executing scheduled workflow ${workflowId} at ${new Date().toISOString()}, trigger time: ${context.date}`);
                    await this.triggerScheduledWorkflow(workflowId, nodeId, userId);
                } catch (error) {
                    console.error(`[CRON ERROR] Error in cron task for workflow ${workflowId}:`, error);
                }
            },
            {
                timezone: "UTC",
                name: `workflow-${workflowId}-${nodeId}`
            }
        );

        this.scheduledJobs.set(jobKey, {
            workflowId,
            nodeId,
            cronExpression,
            task,
        });

        console.log(`Successfully scheduled workflow ${workflowId} with cron: ${cronExpression}`);
    }

    private async triggerScheduledWorkflow(
        workflowId: string,
        nodeId: string,
        userId: string
    ) {
        try {
            console.log(`Triggering scheduled workflow: ${workflowId}`);

            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
            });

            if (!workflow || !workflow.active) {
                console.warn(`[CRON CHECK] Workflow ${workflowId} not found or inactive (active=${workflow?.active}), unscheduling`);
                this.unscheduleWorkflow(workflowId, nodeId);
                return;
            }

            const executionId = uuidv4();

            const executionData = {
                executionId,
                workflowId: workflow.id,
                userId: userId,
                triggeredBy: "schedule" as const,
                triggeredAt: new Date().toISOString(),
                status: "queued" as const,
                priority: "normal" as const,
                maxRetries: 3,
                timeout: 300000,
                metadata: {
                    source: "schedule",
                    nodeId,
                    scheduledTime: new Date().toISOString(),
                },
                workflow: {
                    id: workflow.id,
                    name: workflow.name,
                    active: workflow.active,
                    nodes: workflow.nodes,
                    edges: workflow.edges,
                },
            };

            await workflowQueue.add("execute-workflow", executionData, {
                jobId: executionId,
                priority: 2,
            });

            console.log(`Scheduled workflow ${workflowId} queued for execution: ${executionId}`);
        } catch (error: any) {
            console.error(`Error triggering scheduled workflow ${workflowId}:`, error);
        }
    }

    unscheduleWorkflow(workflowId: string, nodeId: string) {
        const jobKey = `${workflowId}-${nodeId}`;
        const job = this.scheduledJobs.get(jobKey);

        if (job) {
            console.log(`Stopping schedule for ${jobKey}`);
            job.task.stop();
            this.scheduledJobs.delete(jobKey);
            console.log(`Unscheduled workflow ${workflowId} node ${nodeId}`);
        }
    }

    async refreshWorkflowSchedules(workflowId: string) {
        try {
            const existingJobs = Array.from(this.scheduledJobs.entries()).filter(
                ([, job]) => job.workflowId === workflowId
            );

            for (const [, job] of existingJobs) {
                this.unscheduleWorkflow(job.workflowId, job.nodeId);
            }

            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
            });

            if (workflow && workflow.active) {
                const nodes = workflow.nodes as unknown as Array<{ id: string; type: string; data?: Record<string, unknown> }>;
                const scheduleTriggers = nodes.filter(
                    (node) => node.type === "scheduleTrigger"
                );

                for (const trigger of scheduleTriggers) {
                    if (trigger.data && typeof trigger.data.cronExpression === 'string') {
                        this.scheduleWorkflow(
                            workflow.id,
                            trigger.id,
                            trigger.data.cronExpression,
                            workflow.userId
                        );
                    }
                }
            }

            console.log(`Refreshed schedules for workflow ${workflowId}`);
        } catch (error: any) {
            console.error(`Error refreshing schedules for workflow ${workflowId}:`, error);
        }
    }

    getScheduledJobs() {
        return Array.from(this.scheduledJobs.entries()).map(([key, job]) => ({
            key,
            workflowId: job.workflowId,
            nodeId: job.nodeId,
            cronExpression: job.cronExpression,
        }));
    }

    shutdown() {
        console.log("Shutting down schedule service...");
        for (const [, job] of this.scheduledJobs) {
            job.task.stop();
        }
        this.scheduledJobs.clear();
        this.subscriber.disconnect();
        console.log("Schedule service shut down");
    }
}

export const scheduleService = new ScheduleService();
