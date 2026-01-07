import { EventPublisher } from "./services/eventPublisher";
import { ActionExecutor } from "./services/Executor";
import type { NodeData, WorkflowExecutionData } from "./types/types";
import {prisma} from "db"

export class Workflow {
  private executionData: WorkflowExecutionData;
  private adjacencyList: Map<string, string[]>;
  private inDegree: Map<string, number>;
  private nodes: Map<string, NodeData>;
  private eventPublisher = new EventPublisher();

  private actionExecutor: ActionExecutor;
  private nodeOutputs: Map<string, any>;

  constructor(executionData: WorkflowExecutionData) {
    this.executionData = executionData;
    this.adjacencyList = new Map<string, string[]>();
    this.inDegree = new Map<string, number>();
    this.nodes = new Map<string, NodeData>();
    this.actionExecutor = new ActionExecutor();
    this.nodeOutputs = new Map();
  }

  buildGraph() {
    this.executionData.workflow.nodes.map((node) => {
      this.nodes.set(node.id, node);
      this.adjacencyList.set(node.id, []);
      this.inDegree.set(node.id, 0);
    });
    this.executionData.workflow.edges.forEach((edge) => {
      this.adjacencyList.get(edge.source)?.push(edge.target);
      this.inDegree.set(edge.target, (this.inDegree.get(edge.target) ?? 0) + 1);
    });
  }
  detectCycle(): boolean {
    const tempInDegree = new Map(this.inDegree);
    const queue: string[] = [];
    const processed: string[] = [];

    for (let [nodeId, degree] of tempInDegree) {
      if (degree === 0) queue.push(nodeId);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      processed.push(current);

      for (let dependent of this.adjacencyList.get(current) ?? []) {
        tempInDegree.set(dependent, (tempInDegree.get(dependent) ?? 0) - 1);
        if (tempInDegree.get(dependent) === 0) queue.push(dependent);
      }
    }

    return processed.length !== this.nodes.size;
  }

  getExecutionOrder(): string[] {
    const tempInDegree = new Map(this.inDegree);

    const queue: string[] = [];
    const order: string[] = [];

    for (let [nodeId, degree] of tempInDegree) {
      if (degree === 0) queue.push(nodeId);
    }
    while (queue.length > 0) {
      const currNodeId = queue.shift()!;
      order.push(currNodeId);

      for (let neighbour of this.adjacencyList.get(currNodeId) ?? []) {
        tempInDegree.set(neighbour, (tempInDegree.get(neighbour) ?? 0) - 1);
        if (tempInDegree.get(neighbour) === 0) {
          queue.push(neighbour);
        }
      }
    }
    if (order.length !== this.nodes.size) {
      console.log("the graph is Cyclic,");
    }
    return order;
  }

  private async loadCredentials(): Promise<void> {
    try {
      console.log("Loading credentials for user:", this.executionData.userId);

      const userCredentials = await prisma.userCredentials.findMany({
        where: {
          userId: this.executionData.userId,
        },
      });

      console.log("Found credentials:", userCredentials);

      const credMap = new Map();
      userCredentials.forEach((cred) => {
        console.log(`Mapping credential: ${cred.application} ->`, cred);
        credMap.set(cred.application, cred);
      });

      console.log("Credential map:", credMap);
      this.actionExecutor.setCredentials(credMap);
    } catch (error) {
      console.error("Failed to load credentials:", error);
    }
  }

  async executeNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);

    if (!node) {
      console.log("node not found ");
      return;
    }

    if( this.detectCycle()){
      this.eventPublisher.publish("workflow.event", {
      executionId: this.executionData.executionId,
      workflow: this.executionData.workflow.id,
      nodeId: node.id,
      timeStamp: new Date(Date.now()),
      status: "started",
    });
    }

    console.log(`Executing node ${node.id} of type ${node.type}`);

    this.eventPublisher.publish("workflow.event", {
      executionId: this.executionData.executionId,
      workflow: this.executionData.workflow.id,
      nodeId: node.id,
      timeStamp: new Date(Date.now()),
      status: "started",
    });

    try {
      let output: any = null;

      // handling diff node types
      if (node.type === "webhookTrigger") {
        const triggerData = (this.executionData as any).triggerData;

        console.log("Webhook trigger executed with data:", {
          payload: triggerData?.webhookPayload,
          method: triggerData?.method,
          query: triggerData?.queryParams,
        });

        output = {
          webhookPayload: triggerData?.webhookPayload,
          triggerSource: triggerData?.ip,
          method: triggerData?.method,
          queryParams: triggerData?.queryParams,
          headers: triggerData?.headers,
          timestamp: new Date().toISOString(),
        };

        // store webhook output for other nodes to use
        this.nodeOutputs.set(nodeId, output);
      } else if (node.type === "manualTrigger") {
        console.log("Manual trigger executed");

        output = {
          triggeredBy: "manual",
          timestamp: new Date().toISOString(),
          executionId: this.executionData.executionId,
        };

        this.nodeOutputs.set(nodeId, output);
      } else if (node.type === "action") {
        if (!this.actionExecutor) {
          await this.loadCredentials();
        }
        // preparing context from previous node outputs
        const previousOutputs = Object.fromEntries(this.nodeOutputs);
        console.log(`Executing action: ${node.data.actionType}`);

        // execute the action using actionExecutor
        output = await this.actionExecutor.executeAction(node, previousOutputs);

        // store the output for subsequent nodes
        this.nodeOutputs.set(nodeId, output);
        
        console.log()
        console.log("NODE OUTPUTS ==>",this.nodeOutputs)
        console.log()

        console.log(`Action ${node.data.actionType} completed:`, output);
      } else {
        // handling the unknown node types
        console.log(`Unknown node type: ${node.type}`);
        output = {
          error: `Unknown node type: ${node.type}`,
          timestamp: new Date().toISOString(),
        };
      }

      // publishing the success event
      this.eventPublisher.publish("workflow.event", {
        executionId: this.executionData.executionId,
        workflow: this.executionData.workflow.id,
        nodeId: node.id,
        timeStamp: new Date(Date.now()),
        status: "completed",
        data: output,
      });
    } catch (error: any) {
      console.error(`Error executing node ${nodeId}:`, error);

      const errorOutput = {
        error: error.message,
        timestamp: new Date().toISOString(),
        nodeId: nodeId,
      };

      this.nodeOutputs.set(nodeId, errorOutput);

      // publish thefailure event
      this.eventPublisher.publish("workflow.event", {
        executionId: this.executionData.executionId,
        workflow: this.executionData.workflow.id,
        nodeId: node.id,
        timeStamp: new Date(Date.now()),
        status: "failed",
        data: {
          message: error.message,
          stack: error.stack,
        },
      });

      throw error;
    }
  }
  async execute(): Promise<void> {
    this.buildGraph();

    if (this.detectCycle()) {
      console.log("Workflow contains cycles");
      return;
    }

    await this.loadCredentials();
    const executionOrder = this.getExecutionOrder();
    console.log(executionOrder);

    for (let nodeId of executionOrder) {
      try {
        await this.executeNode(nodeId);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Workflow execution stopped at node ${nodeId}:`, error);
        break;
      }
    }
  }
}