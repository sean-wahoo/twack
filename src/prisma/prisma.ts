import "dotenv/config";
import { PrismaClient } from "@/prisma/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  (new PrismaClient({
    accelerateUrl: `${process.env.DATABASE_URL}`,
  }).$extends(withAccelerate()) as PrismaClient);
// .$extends({
//   result: {
//     review: {
//       // ratingAsNumber: {
//       //   compute(review) {
//       //     return review.rating.toNumber();
//       //   },
//       // },
//     },
//   },
// });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// export default prisma;
