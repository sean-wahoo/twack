"use client";
import styles from "./mainSection.module.scss";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Image from "next/image";

const MainSection: React.FC = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.igdb.getGames.queryOptions());

  let gamesByGenre: { [key: string]: typeof data.games } = {};
  for (const game of data.games) {
    console.log({ game });
    for (const genre of game.genres) {
      if (genre.slug in gamesByGenre) {
        gamesByGenre[genre.slug].push(game);
      } else {
        gamesByGenre[genre.slug] = [game];
      }
    }
  }

  const rows = Object.entries(gamesByGenre).map(([genre, games]) => (
    <section key={genre} className={styles.genre_row}>
      <h4>{genre}</h4>
      <div>
        {games.map((game) => {
          const gameSpan = (
            <span className={styles.game} key={game.name + genre}>
              <Image
                src={game.cover.url.replace("small", "big")}
                width={120}
                height={160}
                alt={game.cover.image_id}
              />
              <h5>{game.name}</h5>
            </span>
          );
          return gameSpan;
        })}
      </div>
    </section>
  ));

  return (
    <main className={styles.main_section}>
      <ErrorBoundary fallback={<p>shit!</p>}>
        <Suspense fallback={<p>hold on...</p>}>{rows}</Suspense>
      </ErrorBoundary>
    </main>
  );
};

export default MainSection;
