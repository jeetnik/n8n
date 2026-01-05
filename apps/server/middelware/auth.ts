import type { User } from "db";
import type { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "mysecret";


const isLogged = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies;
    if (!token)
      return res.status(404).json({
        message: "No Access token ",
      });

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded as decodeduser;
    next();
  } catch (error: any) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        error: error.message,
      });
    }
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
export default isLogged;



export type decodeduser = Pick<User, "id" | "email">;

declare global {
  namespace Express {
    interface Request {
      user: decodeduser;
    }
  }
}
