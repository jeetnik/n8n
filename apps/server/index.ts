import express from "express";
import userRouter from "./router/users";
import { workflowRouter } from "./router/workflow";

const app=express();
const PORT=4000
app.use(express.json());

app.use("/api/v1/user",userRouter);
// app.use("/api/v1/workflows",workflowRouter)

app.listen(4000,()=>{
console.log(`server is running on ${PORT}`)
})