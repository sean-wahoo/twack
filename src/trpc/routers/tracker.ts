import z from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { TrackerStatus } from "@/prisma/generated/prisma";
import { TRPCError } from "@trpc/server";

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
        userId: ctx.session.user.id,
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
    const { session } = ctx;

    await ctx.prisma.tracker.delete({
      where: {
        id: trackerId,
        userId: session.user.id,
      },
    });
    return {
      success: true,
    };
  });

const getTrackersByUserId = baseProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const trackers = await ctx.prisma.tracker.findMany({
      where: {
        userId: input.userId,
      },
    });
    if (!trackers.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `tracker search by user id ${input.userId} failed`,
      });
    }
    return trackers;
  });
const getTrackersByUserSlug = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const trackers = await ctx.prisma.tracker.findMany({
      where: {
        user: {
          slug: input.slug,
        },
      },
    });
    if (!trackers.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `tracker search by user slug ${input.slug} failed`,
      });
    }
    return trackers;
  });

export const trackerRouter = createTRPCRouter({
  createTracker,
  updateTracker,
  deleteTracker,
  getTrackersByUserId,
  getTrackersByUserSlug,
});
