import ms, { type StringValue } from "ms";
interface CookieOptionsArgs {
  rememberMe?: boolean;
}

export function generateCookieOptions() {
  const expiry = "7d";
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
    maxAge: ms(expiry as StringValue),
  };
}