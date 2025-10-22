import z from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { trpcErrorHandling } from "@/lib/utils";

const createReview = protectedProcedure
  .input(
    z.object({
      rating: z.number(),
      gameId: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { rating, gameId, title, description } = input;
    try {
      const reviewId = await ctx.prisma.review.create({
        data: {
          userId: ctx.session.user.id,
          rating,
          gameId,
          title,
          description,
        },
      });
      return reviewId;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const getReviewsByUserId = baseProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      const reviews = await ctx.prisma.review.findMany({
        where: {
          userId: input.userId,
        },
      });
      return reviews;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

export const reviewRouter = createTRPCRouter({
  createReview,
  getReviewsByUserId,
});
