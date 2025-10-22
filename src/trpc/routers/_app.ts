import { createTRPCRouter } from "@/trpc/init";
import { igdbRouter } from "./igdb";
import { userRouter } from "./user";
import { trackerRouter } from "./tracker";
import { reviewRouter } from "./review";
import { collectionRouter } from "./collection";

export const appRouter = createTRPCRouter({
  igdb: igdbRouter,
  user: userRouter,
  tracker: trackerRouter,
  review: reviewRouter,
  collection: collectionRouter,
});

export type AppRouter = typeof appRouter;
