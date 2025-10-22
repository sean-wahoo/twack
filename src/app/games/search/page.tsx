import { trpc, prefetch, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import GameSearchArea from "./gameSearchArea";

const GameSearchPage: React.FC<{
  children: React.ReactNode;
  searchParams: Promise<{ [key: string]: string }>;
}> = async ({ searchParams }) => {
  const { query } = await searchParams;
  if (query) {
    prefetch(
      trpc.igdb.getGamesSearch.queryOptions({ search: query, limit: 8 }),
    );
  }

  return <GameSearchArea query={query} />;
};
export default GameSearchPage;
