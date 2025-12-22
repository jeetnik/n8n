import React from "react";
import { prisma } from "db";
export default async function Home(){
const  user=await prisma.user.findMany();
  return(<>
  <h1 className="bg-amber-300 ">hi </h1>
  {user.map((u)=>{
    return <h1 key={u.id}>{`user email is ${u.email} ans user password ${u.passwordHash}`}</h1>

  })}
  </>)
}