import { createTRPCRouter } from "@/trpc/init";
import { igdbRouter } from "./igdb";
import { userRouter } from "./user";
import { trackerRouter } from "./tracker";
import { reviewRouter } from "./review";
import { collectionRouter } from "./collection";
import { likeRouter } from "./like";

export const appRouter = createTRPCRouter({
  igdb: igdbRouter,
  user: userRouter,
  tracker: trackerRouter,
  review: reviewRouter,
  collection: collectionRouter,
  like: likeRouter,
});

export type AppRouter = typeof appRouter;
