import express from "express";
import userRouter from "./router/users";

const app=express();
const PORT=4000
app.use(express.json());

app.use("/api/v1/",userRouter);

app.listen(4000,()=>{
console.log(`server is running on ${PORT}`)
})