import { Workflow } from "./workflow";
import { createClient } from "redis";

const subscriberRedis = createClient({ url: "redis://localhost:6379" });

const connectRedis = async () => {
  try {
    await subscriberRedis.connect();
    console.log("connected to redis");
  } catch (error) {
    console.log("subRedis not connected", error);
  }
};
connectRedis();

const main = async () => {
  console.log("inside Engine");
  const res = await subscriberRedis.zPopMin("workflow:execution");
  if (!res) return;
  
  const exectionData = JSON.parse(res.value);
  console.log("ExecutionDATA====>>>", exectionData);
  console.log("Nodes===> ",exectionData.workflow.nodes)
  console.log("EDGES===> ",exectionData.workflow.edges)

  const workflowObj = new Workflow(exectionData);

  workflowObj.buildGraph();
  if (workflowObj.detectCycle()) {
    return;
  }
  workflowObj.getExecutionOrder();

  console.log("executing the workflow ", exectionData.workflow.id);
  await workflowObj.execute();
};

setInterval(async () => {
  await main();
}, 3000);