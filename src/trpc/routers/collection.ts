import z from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { trpcErrorHandling } from "@/lib/utils";

const getAuthedUserCollections = protectedProcedure.query(async ({ ctx }) => {
  try {
    const userId = ctx.session.user.id;

    const collections = await ctx.prisma.collection.findMany({
      where: {
        userId: userId,
      },
    });

    return collections;
  } catch (e) {
    throw trpcErrorHandling(e);
  }
});

const getCollectionsWithGameId = baseProcedure
  .input(
    z.object({
      gameId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      const collections = await ctx.prisma.collection.findMany({
        where: {
          gameIds: {
            has: input.gameId,
          },
        },
      });
      return collections;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

export const collectionRouter = createTRPCRouter({
  getAuthedUserCollections,
  getCollectionsWithGameId,
});
