import { createClient } from "redis";
import WebSocket, { WebSocketServer } from "ws";

const WS_PORT = parseInt(process.env.WS_PORT || "3002", 10);
const wss = new WebSocketServer({ port: WS_PORT });

const executionClients = new Map<string, WebSocket[]>();
const userClients = new Map<string, WebSocket[]>();

wss.on("connection", (ws, req) => {
    const url = new URL(req.url!, "http://localhost");
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (pathParts[0] === "user" && pathParts[1]) {
        const userId = pathParts[1];
        if (!userClients.has(userId)) userClients.set(userId, []);
        userClients.get(userId)!.push(ws);

        ws.on("close", () => {
            userClients.set(
                userId,
                (userClients.get(userId) ?? []).filter((c) => c !== ws)
            );
        });
    } else {
        const executionId = pathParts.pop()!;
        if (!executionClients.has(executionId)) executionClients.set(executionId, []);
        executionClients.get(executionId)!.push(ws);

        ws.on("close", () => {
            executionClients.set(
                executionId,
                (executionClients.get(executionId) ?? []).filter((c) => c !== ws)
            );
        });
    }
});

const subscriberRedis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

const connectRedis = async () => {
    try {
        await subscriberRedis.connect();
        console.log("Redis connected");
        console.log(`WebSocket server running on port ${WS_PORT}`);
    } catch (error) {
        console.log("error ", error);
    }
};
connectRedis();

subscriberRedis.on("error", (err) => {
    console.error("Redis error:", err);
});

const main = async () => {
    console.log("BE queueWorker")

    await subscriberRedis.subscribe("workflow.event", (msg) => {
        console.log("event ", JSON.parse(msg));
        const event = JSON.parse(msg);
        const { executionId, userId } = event;

        if (executionClients.has(executionId)) {
            for (const ws of executionClients.get(executionId)!) {
                ws.send(JSON.stringify(event));
            }
        }

        if (userId && userClients.has(userId)) {
            for (const ws of userClients.get(userId)!) {
                ws.send(JSON.stringify(event));
            }
        }
    });
};

main();
