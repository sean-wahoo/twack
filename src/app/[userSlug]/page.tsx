import { getQueryClient, HydrateClient, prefetch, trpc } from "@/trpc/server";
import Profile from "./profile";
import { NextPage } from "next";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const UserPage: NextPage<{
  children: React.ReactNode;
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  prefetch(trpc.user.getUserBySlug.queryOptions({ slug: userSlug }));
  return (
    <HydrateClient>
      <Suspense fallback={<p>loading...</p>}>
        <Profile userSlug={userSlug} />
      </Suspense>
    </HydrateClient>
  );
};
export default UserPage;
