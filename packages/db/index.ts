import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export type { CredentialsI, PropertiesI, CredentialSubmitPayload, UserCredentials, IEdge, INode, Measured, NodeData, Position, Workflow } from "./types"
export type { User } from "./generated/prisma/client";