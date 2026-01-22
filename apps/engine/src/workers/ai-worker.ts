import { Worker, Job } from "bullmq";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

interface AITaskPayload {
    taskId: string;
    prompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    tools: any[];
    apiKey: string;
    context: any;
    timestamp: string;
    provider?: string;
    baseUrl?: string;
    httpReferer?: string;
    xTitle?: string;
}

interface LLMResponse {
    success: boolean;
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
    model: string;
    error?: string;
}

async function callOpenAI(payload: AITaskPayload): Promise<LLMResponse> {
    const openai = createOpenAI({
        apiKey: payload.apiKey,
    });

    const { text, usage } = await generateText({
        model: openai(payload.model),
        prompt: payload.prompt,
        temperature: payload.temperature,
    });

    return {
        success: true,
        content: text,
        usage: {
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
        },
        model: payload.model,
    };
}

async function callOpenRouter(payload: AITaskPayload): Promise<LLMResponse> {
    const openrouter = createOpenAI({
        apiKey: payload.apiKey,
        baseURL: payload.baseUrl || "https://openrouter.ai/api/v1",
        headers: {
            "HTTP-Referer": payload.httpReferer || "",
            "X-Title": payload.xTitle || "",
        },
    });

    const { text, usage } = await generateText({
        model: openrouter(payload.model),
        prompt: payload.prompt,
        temperature: payload.temperature,
    });

    return {
        success: true,
        content: text,
        usage: {
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
        },
        model: payload.model,
    };
}

async function processAITask(payload: AITaskPayload): Promise<LLMResponse> {
    if (payload.provider === "openrouter") {
        return await callOpenRouter(payload);
    } else {
        return await callOpenAI(payload);
    }
}

export function createAIWorker(redisConfig: { host: string; port: number }) {
    const aiWorker = new Worker<AITaskPayload, LLMResponse>(
        "ai-tasks",
        async (job: Job<AITaskPayload>) => {
            const start = Date.now();

            try {
                console.log("Processing AI task", {
                    taskId: job.data.taskId,
                    model: job.data.model,
                    provider: job.data.provider || "openai",
                });

                const result = await processAITask(job.data);

                const duration = (Date.now() - start) / 1000;

                console.log("AI task completed", {
                    taskId: job.data.taskId,
                    duration,
                    tokensUsed: result.usage?.totalTokens,
                });

                return result;
            } catch (error: any) {
                console.error("AI task failed", {
                    taskId: job.data.taskId,
                    error: error.message,
                    stack: error.stack,
                });

                return {
                    success: false,
                    content: "",
                    error: error.message,
                    model: job.data.model,
                };
            }
        },
        {
            connection: redisConfig,
            concurrency: 5,
        }
    );

    aiWorker.on("completed", (job) => {
        console.log("AI job completed", {
            jobId: job.id,
            taskId: job.data.taskId,
        });
    });

    aiWorker.on("failed", (job, err) => {
        console.error("AI job failed", {
            jobId: job?.id,
            taskId: job?.data?.taskId,
            error: err.message,
        });
    });

    return aiWorker;
}
