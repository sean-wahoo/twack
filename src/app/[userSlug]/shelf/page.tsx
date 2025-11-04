import { getQueryClient, HydrateClient, prefetch, trpc } from "@/trpc/server";
import { NextPage } from "next";
import styles from "./log.module.scss";
import ShelfArea, { ShelfSidebar } from "./shelf";
import { auth } from "@/lib/auth";

const userLogPage: NextPage<{
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  const session = await auth();
  const queryClient = getQueryClient();
  const user = await queryClient.fetchQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  prefetch(trpc.collection.getAuthedUserCollections.queryOptions());
  prefetch(
    trpc.tracker.getAuthedUserTrackers.queryOptions({ withGames: true }),
  );

  const isOwnProfile = session?.user ? session.user.id === user?.id : false;

  return (
    <HydrateClient>
      <main className={styles.log_area}>
        {isOwnProfile ? <ShelfSidebar user={user} /> : null}
        <ShelfArea userSlug={userSlug} isOwnProfile={isOwnProfile} />
      </main>
    </HydrateClient>
  );
};

export default userLogPage;
