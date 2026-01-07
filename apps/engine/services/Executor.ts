import axios from "axios";
import type { RedisClient } from "bun";
import { createClient } from "redis";

export type RedisClientType=ReturnType< typeof createClient>

export class ActionExecutor{
     private credentials: Map<string, any>;
     private nodeOutput:Map<string,any>;
     private redis:RedisClientType;

     constructor(){
        this.credentials=new Map();
        this.nodeOutput=new Map();
        this.redis=createClient({url:"redis://localhost:6379"});
     }

     async init(){
        if(!this.redis.isOpen){
            await this.redis.connect();
            console.log("Redis is connect");
        }
     }
     async close(){
        if(this.redis.isOpen){
            await this.redis.disconnect();
            console.log("redis is dissconet");
        }
     }

     setCredentials(credentialsMap:Map<string,any>){
        this.credentials=credentialsMap;

     }

     setNodeOutput(nodeId:string,output:any){
  this.nodeOutput.set(nodeId,output);
     }

     getNodeOutput(nodeId:string){
        return this.nodeOutput.get(nodeId);
     }

     async executeAction(node:any,previousOutput:Record<string,any>):Promise<any>{
        const {actionType,parameters,credentials:credConfig}=node.data;
        try{
          switch(actionType){
            case "WebHookNodeType":
                return this.executeWebhookAction(parameters,previousOutput)
            break
          }
        }catch(error:any){
           throw new Error(`Action execution failed: ${error.message}`);

        }


     }
   private resolveDynamicValue(value: any, context: any = {}): any {
    if (typeof value !== "string") return value;

    return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split(".");
      let result = context;

      for (const key of keys) {
        result = result?.[key];
      }

      return result !== undefined ? result : match;
    });
  }

  private async executeWebhookAction(params:any,context:any):Promise<any>{
    const url=this.resolveDynamicValue(params.url,context);
    const method=params.method||"POST";
    const headers = params.headers ? JSON.parse(params.headers) : {};
    const body=params.body?this.resolveDynamicValue(params.body,context):undefined;
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

     

}