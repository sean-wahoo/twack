import z from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { TrackerStatus } from "@/prisma/generated/prisma";
import { TRPCError } from "@trpc/server";
import { trpcErrorHandling } from "@/lib/utils";

const createTracker = protectedProcedure
  .input(
    z.object({
      status: z.enum(TrackerStatus),
      gameId: z.string(),
      complete: z.optional(z.boolean()),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id;
      const trackerId = await ctx.prisma.tracker.create({
        data: {
          userId: userId,
          status: input.status,
          gameId: input.gameId,
          complete: !!input.complete,
        },
      });
      return trackerId;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const updateTracker = protectedProcedure
  .input(
    z.object({
      trackerId: z.string(),
      status: z.enum(TrackerStatus),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
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
        trackerId: input.trackerId,
      };
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const deleteTracker = protectedProcedure
  .input(
    z.object({
      trackerId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
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
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const getTrackersByUserId = baseProcedure
  .input(
    z.object({
      userId: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    try {
      const trackers = await ctx.prisma.tracker.findMany({
        where: {
          userId: input.userId,
        },
      });
      // if (!trackers.length) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: `tracker search by user id ${input.userId} failed`,
      //   });
      // }
      return trackers;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });
const getTrackersByUserSlug = baseProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    try {
      const trackers = await ctx.prisma.tracker.findMany({
        where: {
          user: {
            slug: input.slug,
          },
        },
      });
      // if (!trackers.length) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: `tracker search by user slug ${input.slug} failed`,
      //   });
      // }
      return trackers;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

export const trackerRouter = createTRPCRouter({
  createTracker,
  updateTracker,
  deleteTracker,
  getTrackersByUserId,
  getTrackersByUserSlug,
});
