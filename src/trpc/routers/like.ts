import z from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { Prisma } from "@/prisma/generated/prisma";
import { trpcErrorHandling } from "@/lib/utils";

const toggleLike = protectedProcedure
  .input(
    z.object({
      isLiked: z.boolean(),
      objectType: z.union([z.literal("collection"), z.literal("review")]),
      objectId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    if (input.isLiked) {
      const data = {
        userId: ctx.session.user.id,
        objectId: input.objectId,
        objectType: input.objectType,
      };
      await ctx.prisma.like.create({
        data: data,
      });
    } else {
      await ctx.prisma.like.delete({
        where: {
          userId_objectId: {
            userId: ctx.session.user.id,
            objectId: input.objectId,
          },
          objectType: input.objectType,
        },
      });
    }
  });

const getLikesByObject = baseProcedure
  .input(
    z.object({
      objectType: z.union([z.literal("review"), z.literal("collection")]),
      objectId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      return await ctx.prisma.like.findMany({
        where: {
          objectType: input.objectType,
          objectId: input.objectId,
        },
      });
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

export const likeRouter = createTRPCRouter({
  toggleLike,
  getLikesByObject,
});
