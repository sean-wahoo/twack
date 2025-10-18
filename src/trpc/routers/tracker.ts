import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { Tracker, TrackerStatus } from "@/prisma/generated/prisma";

const createTracker = protectedProcedure
  .input(
    z.object({
      status: z.enum(TrackerStatus),
      gameId: z.string(),
      complete: z.optional(z.boolean()),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    await ctx.prisma.tracker.create({
      data: {
        userId: userId,
        status: input.status,
        gameId: input.gameId,
        complete: !!input.complete,
      },
    });
  });

const updateTracker = protectedProcedure
  .input(
    z.object({
      trackerId: z.string(),
      status: z.enum(TrackerStatus),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const complete = input.status === "COMPLETE";

    await ctx.prisma.tracker.update({
      where: {
        id: input.trackerId,
      },
      data: {
        status: input.status,
        complete,
      },
    });

    return {
      success: true,
    };
  });

const deleteTracker = protectedProcedure
  .input(
    z.object({
      trackerId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const { trackerId } = input;

    await ctx.prisma.tracker.delete({
      where: {
        id: trackerId,
      },
    });
    return {
      success: true,
    };
  });

export const trackerRouter = createTRPCRouter({
  createTracker,
  updateTracker,
  deleteTracker,
});
