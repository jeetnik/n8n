import type { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
import type { decodedUser } from "../config/types";

dotenv.config();

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({
      message: "No access token provided",
    });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decoded as decodedUser;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        message: "Token expired",
      });
    }
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
