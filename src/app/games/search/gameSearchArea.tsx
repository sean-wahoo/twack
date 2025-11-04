"use client";

import GameCard from "@/components/gameCard";
import styles from "./gameSearch.module.scss";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Loading: React.FC<{ query: string }> = ({ query }) => {
  return <p>searching for {query}</p>;
};

const Error: React.FC<{ query: string }> = ({ query }) => {
  return <h1>encountered an error searching for "{query}"</h1>;
};

const gameSearchArea: React.FC<{ query: string }> = ({ query }) => {
  const trpc = useTRPC();
  const { data: gameSearchData } = useSuspenseQuery(
    trpc.igdb.getGamesSearch.queryOptions({ search: query, limit: 8 }),
  );

  return (
    <>
      <ErrorBoundary fallback={<Error query={query} />}>
        <Suspense fallback={<Loading query={query} />}>
          <main className={styles.game_search_area}>
            <h1>
              {gameSearchData.length} result
              {gameSearchData.length !== 1 ? "s" : null} for "{query}"
            </h1>
            {gameSearchData.length ? (
              gameSearchData.map((game) => (
                <GameCard key={game.id} gameId={game.id} game={game} />
              ))
            ) : (
              <p>damn nothing came up!</p>
            )}
          </main>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default gameSearchArea;
