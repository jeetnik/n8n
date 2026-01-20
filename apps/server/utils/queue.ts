import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisConfig = new URL(redisUrl);

export const workflowQueue = new Queue("workflow-execution", {
    connection: {
        host: redisConfig.hostname,
        port: parseInt(redisConfig.port) || 6379,
    },
});
