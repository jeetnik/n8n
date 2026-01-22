import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./router/authRouter";
import workflowRouter from "./router/workflowRouter";
import credRouter from "./router/credRouter";
import webhookRouter from "./router/webhookRouter";
import triggerRouter from "./router/triggersRouter";
import executionRouter from "./router/executionRouter";

const app = express();
const PORT = 4000;

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4000",
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workflow", workflowRouter);
app.use("/api/v1/cred", credRouter);
app.use("/api/v1/webhook", webhookRouter);
app.use("/api/v1/triggers", triggerRouter);
app.use("/api/v1/executions", executionRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});