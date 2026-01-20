import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "db";
import { isLoggedIn } from "../middelware/auth";

const executionRouter = Router();

// Get user executions
executionRouter.get("/", isLoggedIn, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { status, workflowId, limit = "50", offset = "0" } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        const where: any = { userId };

        if (status && typeof status === "string") {
            where.status = status.toUpperCase();
        }

        if (workflowId && typeof workflowId === "string") {
            where.workflowId = workflowId;
        }

        const executions = await prisma.workflowExecution.findMany({
            where,
            orderBy: { startedAt: "desc" },
            take: Number(limit),
            skip: Number(offset),
            select: {
                id: true,
                workflowId: true,
                workflowName: true,
                status: true,
                triggeredBy: true,
                startedAt: true,
                finishedAt: true,
                duration: true,
                error: true,
                workflow: {
                    select: {
                        active: true,
                    },
                },
            },
        });

        const total = await prisma.workflowExecution.count({ where });

        console.log("Executions retrieved", {
            userId,
            count: executions.length,
            total,
            filters: { status, workflowId },
        });

        return res.status(200).json({
            statusCode: 200,
            message: "Executions retrieved successfully",
            data: {
                executions,
                total,
                limit: Number(limit),
                offset: Number(offset),
            },
        });
    } catch (error: any) {
        console.error("Error retrieving executions", { error });
        return res.status(500).json({
            message: "Failed to retrieve executions",
        });
    }
});

// Get execution details
executionRouter.get("/:executionId", isLoggedIn, async (req: Request, res: Response) => {
    try {
        const { executionId } = req.params;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        if (!executionId) {
            return res.status(400).json({
                message: "Execution ID is required",
            });
        }

        const execution = await prisma.workflowExecution.findFirst({
            where: {
                id: executionId,
                userId,
            },
        });

        if (!execution) {
            return res.status(404).json({
                statusCode: 404,
                message: "Execution not found",
                data: null,
            });
        }

        console.log("Execution details retrieved", { executionId, userId });

        return res.status(200).json({
            statusCode: 200,
            message: "Execution details retrieved successfully",
            data: execution,
        });
    } catch (error: any) {
        console.error("Error retrieving execution details", { error });
        return res.status(500).json({
            message: "Failed to retrieve execution details",
        });
    }
});

// Get execution stats
executionRouter.get("/stats/summary", isLoggedIn, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }

        const stats = await prisma.workflowExecution.groupBy({
            by: ["status"],
            where: { userId },
            _count: true,
        });

        const totalExecutions = await prisma.workflowExecution.count({
            where: { userId },
        });

        const recentExecutions = await prisma.workflowExecution.count({
            where: {
                userId,
                startedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        });

        return res.status(200).json({
            statusCode: 200,
            message: "Execution stats retrieved successfully",
            data: {
                total: totalExecutions,
                recent24h: recentExecutions,
                byStatus: stats.reduce((acc: any, stat) => {
                    acc[stat.status] = stat._count;
                    return acc;
                }, {}),
            },
        });
    } catch (error: any) {
        console.error("Error retrieving execution stats", { error });
        return res.status(500).json({
            message: "Failed to retrieve execution stats",
        });
    }
});

export default executionRouter;
