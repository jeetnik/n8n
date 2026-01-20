import { Router } from "express";
import type { Request, Response } from "express";
import { isLoggedIn } from "../middelware/auth";

const triggerRouter = Router();

const AVAILABLE_TRIGGERS = [
  {
    id: "manual-trigger",
    name: "Manual Trigger",
    type: "manual",
    description: "Manually trigger your workflow when needed",
  },
  {
    id: "webhook-trigger",
    name: "Webhook Trigger",
    type: "webhook",
    description: "Trigger workflow via HTTP webhook endpoint",
  },
  {
    id: "schedule-trigger",
    name: "Schedule Trigger",
    type: "schedule",
    description: "Run workflow on a scheduled interval (cron)",
  },
];

// Get all triggers
triggerRouter.get("/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        message: "user does not exist",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "triggers returned",
      data: AVAILABLE_TRIGGERS,
    });
  } catch (error) {
    console.error("Get triggers error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Create trigger (not implemented - triggers are hardcoded)
triggerRouter.post("/", isLoggedIn, async (req: Request, res: Response) => {
  return res.status(501).json({
    statusCode: 501,
    message: "Triggers are now hardcoded in the system",
    data: null,
  });
});

export default triggerRouter;
