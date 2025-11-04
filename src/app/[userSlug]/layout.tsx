import styles from "./page.module.scss";
import { NextPage } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const UserLayout: NextPage<{
  children: React.ReactNode;
  params: Promise<{ userSlug: string }>;
}> = async ({ children, params }) => {
  const { userSlug } = await params;
  prefetch(trpc.user.getUserBySlug.queryOptions({ slug: userSlug }));

  return (
    <HydrateClient>
      <main className={styles.profile_section}>{children}</main>
    </HydrateClient>
  );
};
export default UserLayout;
