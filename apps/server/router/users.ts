import { prisma } from "db";
import { Router } from "express";
import type { Request, Response } from "express";
import { createHash, generateToken } from "../utils/helper";
import ms, { type StringValue } from "ms";

const userRouter = Router();
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || 15;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "7d";
userRouter.post("/signin", async (req: Request, res: Response) => {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const ispasswordVaild = password === user.passwordHash;
    if (!ispasswordVaild) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const token = generateToken(user);
    const refreshtoken = createHash(token!);
    // const accesstoken=createHash(token!);
    const expiresAt = new Date(
      Date.now() + ms(ACCESS_TOKEN_EXPIRY as StringValue)
    );
    const updateUser = await prisma.user.update({
      where: { email },
      data: { refreshToken: refreshtoken, refreshTokenExpiry: expiresAt },
    });

    res.status(200).json({ message: "login successful", userdata: updateUser });}catch(error){
      return res.status(500).json({
        messgae:"Internal server error"
      })

    }
  
});

userRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password is required",
      });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = await prisma.user.create({
      data: {
        email: email,
        passwordHash: password,
        lastLoggedId: new Date(),
      },
    });

    res.status(200).json({
      message: "user created successful",
      userId: newUser.id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});


export default userRouter;
