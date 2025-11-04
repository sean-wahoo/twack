import "dotenv/config";
import { PrismaClient } from "@/prisma/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate()).$extends({
  result: {
    review: {
      ratingAsNumber: {
        compute(review) {
          return review.rating.toNumber();
        },
      },
    },
  },
});
const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
