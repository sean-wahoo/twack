import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
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

export const collectionRouter = createTRPCRouter({
  getAuthedUserCollections,
});
