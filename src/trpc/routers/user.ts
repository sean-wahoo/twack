import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

const getUserByName = baseProcedure
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .query(async (opts) => {
    const name = opts.input.name;
    const userFromDb = await opts.ctx.prisma.user.findFirst({
      where: {
        name: name,
      },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        trackers: true,
        reviews: true,
      },
    });
    if (userFromDb) {
      return userFromDb;
    } else {
      return null;
    }
  });

export const userRouter = createTRPCRouter({
  getUserByName,
});
