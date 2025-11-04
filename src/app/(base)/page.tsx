import styles from "./page.module.scss";
import { parseGame } from "@/lib/types";
import {
  getIgdbApiUrl,
  buildRequestData,
  dateToUts,
  getIgdbHeaders,
} from "@/lib/utils";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import GameCard, { Loading as GameCardLoading } from "@/components/gameCard";
import Loading from "./loading";
import Carousel from "@/components/carousel";

const getGames = async () => {
  const url = new URL(getIgdbApiUrl("/games"));
  const d = new Date(2015, 3);
  const requestBody = buildRequestData({
    where: `aggregated_rating_count > 0 & rating_count > 8 & first_release_date > ${dateToUts(d)}`,
    sort: "rating desc",
  });
  const gamesRes = await fetch(url, {
    method: "POST",
    body: requestBody,
    headers: getIgdbHeaders(),
  });

  const gamesJson = await gamesRes.json();
  const parsedGames = [];
  for (const rawGame of gamesJson) {
    parsedGames.push(parseGame(rawGame));
  }
  return parsedGames;
};

export default async function Home() {
  "use cache";
  const gamesByGenre: { [key: string]: typeof games } = {};
  const games = await getGames();
  for (const game of games ?? []) {
    for (const genre of game.genres) {
      if (Array.isArray(gamesByGenre[genre.slug])) {
        gamesByGenre[genre.slug]!.push(game);
      } else {
        gamesByGenre[genre.slug] = [game];
      }
    }
  }

  const rows = Object.entries(gamesByGenre).map(([genre, games]) => (
    <section key={genre} className={styles.genre_row}>
      <h4>{genre}</h4>
      <Carousel anchor={genre}>
        {games.map((game) => (
          <GameCard
            key={game.id}
            gameId={game.id}
            game={game}
            direction="vertical"
          />
        ))}
      </Carousel>
    </section>
  ));

  return <>{rows}</>;
}
