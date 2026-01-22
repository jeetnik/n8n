import ms, { type StringValue } from "ms";

const nodeEnv = process.env.NODE_ENV || "development";

export function generateCookieOptions() {
  const expiry = "7d";
  return {
    httpOnly: true,
    secure: nodeEnv === "production",
    sameSite: nodeEnv === "production" ? "none" as const : "lax" as const,
    maxAge: ms(expiry as StringValue),
  };
}