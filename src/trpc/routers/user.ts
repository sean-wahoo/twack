import z from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { trpcErrorHandling } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";
import { Review, User } from "@/prisma/generated/prisma";

const getUserByName = baseProcedure
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .query(async (opts) => {
    try {
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });
const getUserById = baseProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    try {
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
          reviews: {
            omit: {
              rating: true,
            },
          },
        },
      });
      if (!userFromDb) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }
      console.log({ userFromDb });
      return userFromDb;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const getUserBySlug = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    try {
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
          reviews: {
            omit: {
              rating: true,
            },
          },
        },
      });
      if (!userFromDb) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }
      // for (const review of userFromDb.reviews) {
      //   // (review as SafeReview).rating = review.rating.toNumber();
      // }
      return userFromDb;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });
export const userRouter = createTRPCRouter({
  getUserByName,
  getUserById,
  getUserBySlug,
});
