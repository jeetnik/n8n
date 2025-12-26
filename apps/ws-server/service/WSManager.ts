import { WebSocket, WebSocketServer } from "ws";

export class WSManger {
  private static instance: WSManger;
  private clients: Map<string, Set<WebSocket>> = new Map();
  private roomtoclient:Map<string,Set<WebSocket>>=new Map();
  private wss: WebSocketServer;
  private constructor(PORT:number) {
    this.wss = new WebSocketServer({ port: PORT });
    console.log(`Websocket server is running on PORT:${PORT}`);
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("client is connect");
     if (!this.roomtoclient.has("1")) {
  this.roomtoclient.set("1", new Set());
}
this.roomtoclient.get("1")!.add(ws);

      ws.on("message", (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.send(ws, message);
          this.handleMessage(ws, message);
        } catch (e) {
          this.send(ws, { type: "error", error: "Invalid JSON format" });
        }
      });
      ws.on("close",()=>{
        this.removeClient(ws);
      })
        ws.on("error", (err) => {
        console.error("WebSocket error:", err);
      });
    });
  }
  static getInstance(port:number){
    if(!WSManger.instance){
        WSManger.instance=new WSManger(port);

    }
     return WSManger.instance;
  }
  subscribe(ws: WebSocket, executionId: string) {
    if (!this.clients.has(executionId)) {
      this.clients.set(executionId, new Set());
    }
    this.clients.get(executionId)!.add(ws);
    this.send(ws, {
      type: "subscribed",
      executionId,
      message: `Subscribed to execution:${executionId}`,
    });
  }

  unsubscribe(ws: WebSocket, executionId: string) {
    const clients = this.clients.get(executionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size == 0) {
        this.clients.delete(executionId);
      }
    }
    this.send(ws, {
      type: "unsubscribed",
      executionId,
      timestamp: Date.now(),
    });
  }
  removeClient(ws: WebSocket) {
    this.clients.forEach((clients, executionId) => {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(executionId);
      }
    });
  }
  send(ws: WebSocket, data: any) {
    if (ws.readyState == WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
  broadcasts(executionId: string, data: any) {
    const clients = this.clients.get(executionId);
    if (!clients || clients.size === 0) {
      return;
    }
    const message = JSON.stringify({
      type: "execution-update",
      executionId,
      timestamp: Date.now(),
      data,
    });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
  handleMessage(ws:WebSocket,message:any){
    const clients=this.roomtoclient.get("1");
    clients?.forEach((client)=>{
        if(client !== ws && client.readyState==WebSocket.OPEN){
            this.send(client,message);
        }
    })

  }
}
