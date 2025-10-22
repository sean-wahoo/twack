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
  return (
    <>
      <Profile userSlug={userSlug} />
    </>
  );
};
export default UserPage;
