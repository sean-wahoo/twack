import "dotenv/config";
import { PrismaClient } from "@/prisma/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

// const prisma = new PrismaClient({
//   datasources: {
//     db: {
//       url: process.env.DATABASE_URL,
//     },
//   },
// });
const prisma = new PrismaClient().$extends(withAccelerate());
const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
