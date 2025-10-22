import {
  caller,
  getQueryClient,
  HydrateClient,
  prefetch,
  trpc,
} from "@/trpc/server";
import { NextPage } from "next";
import styles from "./log.module.scss";
import TrackersArea from "./trackersArea";
import { getSession } from "@/lib/auth";

const userLogPage: NextPage<{
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  const session = await getSession();
  const queryClient = getQueryClient();
  const user = await queryClient.fetchQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  const trackerGameIds = user!.trackers.map((tracker) => tracker.gameId);
  prefetch(
    trpc.igdb.getGamesById.queryOptions(
      { gameIds: trackerGameIds },
      {
        enabled: trackerGameIds.length > 0,
        initialData: [],
        initialDataUpdatedAt: 0,
      },
    ),
  );

  const isOwnProfile = session?.user ? session.user.id === user?.id : false;

  console.log({ session, user });

  return (
    <HydrateClient>
      <main className={styles.main_log_area}>
        <h2>{isOwnProfile ? "Your" : `${user!.name}'s`} game log</h2>
        <TrackersArea userSlug={userSlug} isOwnProfile={isOwnProfile} />
      </main>
    </HydrateClient>
  );
};

export default userLogPage;
