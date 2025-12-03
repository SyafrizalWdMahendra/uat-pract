import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  adapter: process.env.DATABASE_URL,
});
