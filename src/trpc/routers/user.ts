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
        slug: true,
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
const getUserById = baseProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { userId } = input;
    const userFromDb = await ctx.prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        image: true,
        slug: true,
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

const getUserBySlug = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { slug } = input;
    const userFromDb = await ctx.prisma.user.findFirst({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        image: true,
        slug: true,
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
  getUserById,
  getUserBySlug,
});
