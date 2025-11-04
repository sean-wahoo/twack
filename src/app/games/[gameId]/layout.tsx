import { ErrorBoundary } from "react-error-boundary";
import styles from "./gamePage.module.scss";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { auth } from "@/lib/auth";
const GamePageLayout = async ({
  children,
  params,
}: {
  params: Promise<{ gameId: string }>;
  children: React.ReactNode;
}) => {
  const { gameId } = await params;
  const session = await auth();
  if (session!.user) {
    prefetch(
      trpc.tracker.getTrackersByUserId.queryOptions({
        userId: session!.user.id,
      }),
    );
    prefetch(trpc.collection.getAuthedUserCollections.queryOptions());
  }
  prefetch(
    trpc.collection.getCollectionsWithGameId.queryOptions({
      gameId: gameId,
    }),
  );
  prefetch(
    trpc.review.getReviewsByIgdbGameId.queryOptions({
      gameId: gameId,
    }),
  );
  return (
    <HydrateClient>
      <main className={styles.main_game_area}>
        <ErrorBoundary fallback={<p>bro what??</p>}>{children}</ErrorBoundary>
      </main>
    </HydrateClient>
  );
};

export default GamePageLayout;
