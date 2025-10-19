import { prefetch, trpc } from "@/trpc/server";
import { NextPage } from "next";
import styles from "./log.module.scss";
import TrackersArea from "./trackersArea";

const userLogPage: NextPage<{
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  prefetch(trpc.tracker.getTrackersByUserSlug.queryOptions({ slug: userSlug }));

  return (
    <main className={styles.main_log_area}>
      <h2>Your games</h2>
      <TrackersArea userSlug={userSlug} />
    </main>
  );
};

export default userLogPage;
