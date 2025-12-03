import { PrismaClient } from "../src/generated/client.js";
import dotenv from "dotenv";
dotenv.config();

export const prisma = new PrismaClient({
  adapter: process.env.DATABASE_URL,
} as any);
