import type { User } from "db";

export type decodedUser = Pick<User, "id" | "email">;

declare global {
  namespace Express {
    interface Request {
      user: decodedUser;
    }
  }
}
export { };