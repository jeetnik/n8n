import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";
const ACCESS_TOKEN_SECRET=process.env.ACCESS_TOKEN_SECRET||"mysecret"
const ACCESS_TOKEN_EXPIRY=process.env.ACCESS_TOKEN_EXPIRY||"7d"

export function createHash(token: string) {
  const hashtoken = crypto.createHash("sha256").update(token).digest("hex");
  return hashtoken;
}

export function generateToken(data: any) {
  return jwt.sign(
    {
      id: data.id,
      email: data.email,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn:ACCESS_TOKEN_EXPIRY as StringValue }
  );
}
