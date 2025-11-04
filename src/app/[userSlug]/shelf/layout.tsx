import { trpc, getQueryClient, prefetch, HydrateClient } from "@/trpc/server";

const LogLayout = async ({
  params,
  children,
}: {
  params: Promise<{ userSlug: string }>;
  children: React.ReactNode;
}) => {
  const { userSlug } = await params;
  const queryClient = getQueryClient();
  const user = await queryClient.fetchQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  const trackerGameIds = user!.trackers.map((tracker) =>
    Number(tracker.gameId),
  );
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
  return <HydrateClient>{children}</HydrateClient>;
};

export default LogLayout;
