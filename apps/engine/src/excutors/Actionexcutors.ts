import axios from "axios";
import Imap from "imap";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
import { Resend } from "resend";
import { Queue, QueueEvents } from "bullmq";

type RedisClientType = ReturnType<typeof createClient>;

export class ActionExecutor {
    private credentials: Map<string, any>;
    private nodeOutputs: Map<string, any>;
    private redis: RedisClientType;
    private aiQueue: Queue;
    private queueEvents: QueueEvents;

    constructor() {
        this.credentials = new Map();
        this.nodeOutputs = new Map();
        this.redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });

        const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
        const redisConfig = new URL(redisUrl);
        this.aiQueue = new Queue("ai-tasks", {
            connection: {
                host: redisConfig.hostname,
                port: parseInt(redisConfig.port) || 6379,
            },
        });

        this.queueEvents = new QueueEvents("ai-tasks", {
            connection: {
                host: redisConfig.hostname,
                port: parseInt(redisConfig.port) || 6379,
            },
        });
    }

    async init() {
        if (!this.redis.isOpen) {
            await this.redis.connect();
            console.log("Redis connected");
        }
    }


    async close() {
        if (this.redis.isOpen) {
            await this.redis.disconnect();
            console.log("Redis disconnected");
        }
    }

    setCredentials(credentialsMap: Map<string, any>) {
        this.credentials = credentialsMap;
    }

    getNodeOutput(nodeId: string): any {
        return this.nodeOutputs.get(nodeId);
    }

    setNodeOutput(nodeId: string, output: any) {
        this.nodeOutputs.set(nodeId, output);
    }

    private resolveDynamicValue(value: any, context: any = {}): any {
        if (typeof value !== "string") return value;

        const originalValue = value;
        let hasReplacements = false;

        const resolved = value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const trimmedPath = path.trim();
            const keys = trimmedPath.split(".");
            let result = context;

            for (const key of keys) {
                if (result === null || result === undefined) {
                    break;
                }
                if (key.includes("[")) {
                    const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                    if (arrayMatch) {
                        result = result[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
                    }
                } else {
                    result = result[key];
                }
            }

            if (result !== undefined && result !== null) {
                hasReplacements = true;
                if (typeof result === "object") {
                    console.log(`Resolved {{${trimmedPath}}} -> [Object: ${JSON.stringify(result).substring(0, 100)}...]`);
                    return JSON.stringify(result);
                }
                console.log(`Resolved {{${trimmedPath}}} -> "${String(result).substring(0, 100)}${String(result).length > 100 ? '...' : ''}"`);
                return String(result);
            }

            console.log(`Could not resolve {{${trimmedPath}}} - Available keys in context:`, Object.keys(context));
            return match;
        });

        if (hasReplacements && originalValue !== resolved) {
            console.log(`Template transformation:\n   Before: "${originalValue.substring(0, 150)}${originalValue.length > 150 ? '...' : ''}"\n   After:  "${resolved.substring(0, 150)}${resolved.length > 150 ? '...' : ''}"`);
        }

        return resolved;
    }

    async executeAction(
        node: any,
        previousOutputs: Record<string, any> = {}
    ): Promise<any> {
        const { actionType, parameters, credentials: credConfig } = node.data;
        console.log("\n=== EXECUTING ACTION NODE ===");
        console.log("Node ID:", node.id);
        console.log("Action Type:", actionType);
        console.log("Available Context (Previous Outputs):", Object.keys(previousOutputs));
        console.log("Parameters:", parameters);
        console.log("================================\n");

        try {
            switch (actionType) {
                case "TelegramNodeType":
                    return await this.executeTelegramAction(
                        parameters,
                        credConfig,
                        previousOutputs
                    );

                case "WebHookNodeType":
                    return await this.executeWebhookAction(parameters, previousOutputs);

                case "GmailTrigger":
                    return await this.executeEmailTriggerAction(
                        parameters,
                        credConfig,
                        previousOutputs
                    );

                case "openAiNodeType":
                    return await this.executeOpenAiAction(
                        parameters,
                        credConfig,
                        previousOutputs
                    );

                case "openRouterNodeType":
                    return await this.executeOpenRouterAction(
                        parameters,
                        credConfig,
                        previousOutputs
                    );

                case "ResendNodeType":
                    return await this.executeResendAction(
                        parameters,
                        credConfig,
                        previousOutputs
                    );

                default:
                    throw new Error(`Unknown action type: ${actionType}`);
            }
        } catch (error: any) {
            throw new Error(`Action execution failed: ${error.message}`);
        }
    }

    private async executeOpenAiAction(
        params: any,
        credConfig: any,
        context: any
    ) {
        console.log("==== OPEN AI ACTION ====");
        console.log("1.", credConfig);
        console.log("2.", context);
        console.log("3.", params);

        if (!credConfig || !credConfig.data?.apiKey) {
            throw new Error("OpenAI API key not configured");
        }

        const taskId = uuidv4();
        console.log(`Generated task ID: ${taskId}`);

        const resolvedPrompt = this.resolveDynamicValue(params.prompt, context);

        const taskPayload = {
            taskId,
            prompt: resolvedPrompt,
            model: params.model || "gpt-5-mini",
            temperature: params.temperature || 0.7,
            maxTokens: params.maxTokens || 1000,
            tools: params.tools || [],
            apiKey: credConfig.data.apiKey,
            context: context,
            timestamp: new Date().toISOString(),
        };


        try {
            const job = await this.aiQueue.add(taskId, taskPayload);

            const result = await job.waitUntilFinished(this.queueEvents, 120000);

            if (!result.success) {
                throw new Error(result.error || "AI task failed");
            }

            return {
                success: true,
                taskId,
                actionType: "openAiNodeType",
                content: result.content,
                data: result,
                completedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            throw new Error(`OpenAI action failed: ${error.message}`);
        }
    }

    private async executeOpenRouterAction(
        params: any,
        credConfig: any,
        context: any
    ) {
        console.log("==== OPENROUTER ACTION ====");
        console.log("1.", credConfig);
        console.log("2.", context);
        console.log("3.", params);

        if (!credConfig || !credConfig.data?.apiKey) {
            throw new Error("OpenRouter API key not configured");
        }

        const taskId = uuidv4();
        console.log(`Generated task ID: ${taskId}`);

        const resolvedPrompt = this.resolveDynamicValue(params.prompt, context);

        const taskPayload = {
            taskId,
            prompt: resolvedPrompt,
            model: params.model || "openai/gpt-5-mini",
            temperature: params.temperature || 0.7,
            maxTokens: params.maxTokens || 1000,
            tools: params.tools || [],
            apiKey: credConfig.data.apiKey,
            baseUrl: credConfig.data.url || "https://openrouter.ai/api/v1",
            httpReferer: credConfig.data.httpReferer || "",
            xTitle: credConfig.data.xTitle || "",
            provider: "openrouter",
            context: context,
            timestamp: new Date().toISOString(),
        };

        try {
            const job = await this.aiQueue.add(taskId, taskPayload);

            const result = await job.waitUntilFinished(this.queueEvents, 120000);

            if (!result.success) {
                throw new Error(result.error || "AI task failed");
            }

            return {
                success: true,
                taskId,
                actionType: "openRouterNodeType",
                content: result.content,
                data: result,
                completedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            throw new Error(`OpenRouter action failed: ${error.message}`);
        }
    }

    private async executeEmailTriggerAction(
        params: any,
        credConfig: any,
        context: any
    ) {
        console.log("=== EMAIL TRIGGER ACTION ===");

        if (!credConfig || !credConfig.data?.access_token) {
            throw new Error("Gmail access token not configured");
        }

        const accessToken = credConfig.data.access_token;
        console.log("ACCESS_TOKEN==> ", accessToken);

        const idToken = credConfig.data.id_token;
        const payload = JSON.parse(
            Buffer.from(idToken.split(".")[1], "base64").toString()
        );
        const emailAddress = payload.email;

        console.log("EMAIL ADDRESS ==> ", emailAddress);

        return new Promise((resolve, reject) => {
            const xoauth2 = Buffer.from(
                `user=${emailAddress}\x01auth=Bearer ${accessToken}\x01\x01`,
                "utf-8"
            ).toString("base64");

            const imap = new Imap({
                user: emailAddress,
                xoauth2,
                host: "imap.gmail.com",
                port: 993,
                tls: true,
                password: "",
            });

            let emailReceived = false;

            const timeout = setTimeout(
                () => {
                    if (!emailReceived) {
                        console.log("No email received");
                        imap.end();
                        resolve({
                            success: false,
                            message: "No email received within 5 minutes",
                            waitedFor: 5 * 60 * 1000,
                        });
                    }
                },
                5 * 60 * 1000
            );

            imap.once("ready", () => {
                console.log("IMAP connected, waiting for emails...");

                imap.openBox("INBOX", false, (err, box) => {
                    if (err) {
                        clearTimeout(timeout);
                        reject(new Error(`Cannot open inbox: ${err.message}`));
                        return;
                    }

                    imap.on("mail", () => {
                        if (emailReceived) return;

                        console.log("New email detected!");

                        const fetch = imap.seq.fetch("*", {
                            bodies: "",
                            struct: true,
                        });

                        emailReceived = true;
                        clearTimeout(timeout);

                        fetch.on("message", (msg) => {
                            let emailContent = "";

                            msg.on("body", (stream) => {
                                stream.on("data", (chunk) => {
                                    emailContent += chunk.toString("utf8");
                                });
                            });

                            msg.once("end", async () => {
                                try {
                                    const { simpleParser } = require("mailparser");
                                    const parsed = await simpleParser(emailContent);

                                    const emailData = {
                                        from: parsed.from?.text || "",
                                        to: parsed.to?.text || "",
                                        subject: parsed.subject || "",
                                        body: parsed.text || "",
                                        html: parsed.html || "",
                                        receivedAt: new Date().toISOString(),
                                    };

                                    console.log(`Latest email received from: ${emailData.from}`);
                                    console.log(`Subject: ${emailData.subject}`);

                                    imap.end();
                                    resolve({
                                        success: true,
                                        sentAt: new Date().toISOString(),
                                        actionType: "GmailTrigger",
                                        content: emailData.body,
                                        subject: emailData.subject,
                                        from: emailData.from,
                                        data: emailData,
                                        message: "Latest email received successfully",
                                    });
                                } catch (error: any) {
                                    imap.end();
                                    reject(new Error(`Error parsing email: ${error.message}`));
                                }
                            });
                        });

                        fetch.once("error", (err) => {
                            clearTimeout(timeout);
                            imap.end();
                            reject(new Error(`Fetch error: ${err.message}`));
                        });
                    });
                });
            });

            imap.once("error", (err: any) => {
                clearTimeout(timeout);
                reject(new Error(`IMAP error: ${err.message}`));
            });

            imap.connect();
        });
    }

    private async executeTelegramAction(
        params: any,
        credConfig: any,
        context: any
    ): Promise<any> {
        console.log("=== TELEGRAM ACTION DEBUG ===");

        console.log("CONTEXTT===>>", context);
        console.log();
        const botToken = credConfig?.data?.accessToken;
        let chatId = this.resolveDynamicValue(params.chatId, context);
        const message = this.resolveDynamicValue(params.message, context);
        const parseMode = params.parseMode;

        if (chatId) {
            chatId = chatId.toString().trim();
            if (chatId && !chatId.startsWith('@') && isNaN(Number(chatId))) {
                chatId = `@${chatId}`;
            }
        }

        console.log("Bot token:", botToken);
        console.log("Chat ID:", chatId);
        console.log("Message:", message);
        console.log("Parse mode:", parseMode);

        const baseUrl = credConfig.data.baseUrl || "https://api.telegram.org";
        const telegramUrl = `${baseUrl}/bot${botToken}/sendMessage`;

        console.log("Telegram URL:", telegramUrl);

        const payload: any = {
            chat_id: chatId,
            text: message,
        };

        if (parseMode && parseMode !== 'None' && parseMode !== '') {
            payload.parse_mode = parseMode;
        }

        console.log("Payload:", JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post(telegramUrl, payload, {
                timeout: 10000,
            });

            console.log("Telegram API Response:", response.data);

            if (!response.data.ok) {
                throw new Error(`Telegram API error: ${response.data.description}`);
            }

            return {
                success: true,
                sentAt: new Date(response.data.result.date * 1000).toISOString(),
                actionType: "TelegramNodeType",
                data: {
                    messageId: response.data.result.message_id,
                    chatId: response.data.result.chat.id,
                    payload: payload,
                },
            };
        } catch (error: any) {
            console.log("Telegram API Error Details:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    }

    private async executeWebhookAction(params: any, context: any): Promise<any> {
        const url = this.resolveDynamicValue(params.url, context);
        const method = params.method || "POST";
        const headers = params.headers ? JSON.parse(params.headers) : {};
        const body = params.body
            ? this.resolveDynamicValue(params.body, context)
            : undefined;

        const response = await axios({
            method: method.toLowerCase(),
            url,
            headers,
            data: body ? JSON.parse(body) : undefined,
            timeout: 30000,
        });

        return {
            success: true,
            status: response.status,
            data: response.data,
            headers: response.headers,
        };
    }

    private async executeResendAction(
        params: any,
        credConfig: any,
        context: any
    ): Promise<any> {
        console.log("=== RESEND ACTION DEBUG ===");
        console.log("Context:", context);
        console.log("Params:", params);
        console.log("Credentials:", credConfig);

        if (!credConfig || !credConfig.data?.apiKey) {
            throw new Error("Resend API key not configured");
        }

        const apiKey = credConfig.data.apiKey;
        const resend = new Resend(apiKey);

        const to = this.resolveDynamicValue(params.to, context);
        const from = this.resolveDynamicValue(params.from, context);
        const subject = this.resolveDynamicValue(params.subject, context);
        const html = this.resolveDynamicValue(params.html, context);
        const text = params.text ? this.resolveDynamicValue(params.text, context) : undefined;
        const replyTo = params.replyTo ? this.resolveDynamicValue(params.replyTo, context) : undefined;

        console.log("Sending email:", { to, from, subject });

        try {
            const response = await resend.emails.send({
                from,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
                text,
                replyTo,
            });

            console.log("Resend API Response:", response);

            if (response.error) {
                throw new Error(`Resend API error: ${response.error.message}`);
            }

            return {
                success: true,
                sentAt: new Date().toISOString(),
                actionType: "ResendNodeType",
                data: {
                    emailId: response.data?.id,
                    to,
                    from,
                    subject,
                },
            };
        } catch (error: any) {
            console.log("Resend API Error Details:", {
                message: error.message,
                error,
            });
            throw new Error(`Resend email failed: ${error.message}`);
        }
    }
}
