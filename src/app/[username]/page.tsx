import { getQueryClient, HydrateClient, prefetch, trpc } from "@/trpc/server";
import Profile from "./profile";
import { NextPage } from "next";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const UserPage: NextPage<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}> = async ({ params }) => {
  const { username } = await params;
  prefetch(trpc.user.getUserByName.queryOptions({ name: username }));
  return (
    <HydrateClient>
      <Suspense fallback={<p>loading...</p>}>
        <Profile username={username} />
      </Suspense>
    </HydrateClient>
  );
};
export default UserPage;
