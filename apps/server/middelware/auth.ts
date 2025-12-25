import { type Response, type Request, type NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECERT = "abcd";
interface JWTPayload {
  id: string;
  email: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
export default function auth(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("IN THE AUTH")
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(403).send({
        message: "NO AUTHORIZTIOB IN HEADER",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        message: "NO token in the header",
      });
    }
    const decode = jwt.verify(token, JWT_SECERT) as JWTPayload;
    if (typeof decode.id !== "string" || typeof decode.email !== "string") {
      return res.status(403).send({
        messgae: "INVALID TOKEN PAYLOAD",
      });
    }
    req.user = decode;
    console.log("user request is forwared");
    next();
  } catch (e) {
    console.log(e);
    res.status(404).send({
      message: "INVALID TOKEN",
    });
  }
}
