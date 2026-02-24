import styles from "./page.module.scss";
import { Game, parseGame, PopPrimitive } from "@/lib/types";
import {
  getIgdbApiUrl,
  buildRequestData,
  dateToUts,
  getIgdbHeaders,
  buildMultiQueryData,
  c,
  MultiRequestDataOptions,
} from "@/lib/utils";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import GameCard, { Loading as GameCardLoading } from "@/components/gameCard";
import Loading from "./loading";
import Carousel from "@/components/carousel";

const WANT_TO_PLAY = 2;
const PLAYED = 3;
const PEAK_24HR = 5;
const TOTAL_REVIEWS = 8;
const WISHLISTED_UPCOMING = 10;

const PS_STEAM = 1;
const PS_GOG = 5;
const PS_YOUTUBE = 10;
const PS_TWITCH = 14;

const getIgdbToken = async () => {};

const getGames = async () => {
  const url = new URL(getIgdbApiUrl("/games"));
  const d = new Date(2015, 3);
  const requestBody = buildRequestData({
    where: `aggregated_rating_count > 0 & rating_count > 8 & first_release_date > ${dateToUts(d)}`,
    sort: "rating desc",
    limit: 50,
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

const getGamesById = async (gameIds: number[]) => {
  const url = new URL(getIgdbApiUrl("/games"));
  const d = new Date(2015, 3);
  const requestBody = buildRequestData({
    where: `id = (${gameIds.join(",")})`,
    sort: "rating desc",
    limit: gameIds.length,
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

const getPopularityTypes = async () => {
  const url = new URL(getIgdbApiUrl("/popularity_types"));
  const requestBody = buildRequestData({
    fields: ["*"],
    sort: "id asc",
  });
  const popularityTypes = await fetch(url, {
    method: "POST",
    body: requestBody,
    headers: getIgdbHeaders(),
  });

  const popularityTypesJson = await popularityTypes.json();

  return popularityTypesJson;
};

const getGamesByPopularity = async (types: number[]) => {
  const url = new URL(getIgdbApiUrl("/multiquery"));
  const multiRequestBody = buildMultiQueryData([
    {
      name: "wishlisted",
      fields: "*",
      endpoint: "popularity_primitives",
      where: `popularity_type = ${WISHLISTED_UPCOMING}`,
      sort: "value desc",
      limit: 7,
    },
    {
      name: "played",
      fields: "*",
      endpoint: "popularity_primitives",
      where: `popularity_type = ${PLAYED}`,
      sort: "value desc",
      limit: 7,
    },
    {
      name: "24hr",
      fields: "*",
      endpoint: "popularity_primitives",
      where: `popularity_type = ${PEAK_24HR}`,
      sort: "value desc",
      limit: 7,
    },
  ]);
  const gamesByPop = await fetch(url, {
    method: "POST",
    body: multiRequestBody,
    headers: getIgdbHeaders(),
  });
  const gamesByPopJson = await gamesByPop.json();
  const gameIds = [];
  for (const { result } of gamesByPopJson) {
    gameIds.push(
      ...result.map(({ game_id }: { game_id: number }) => Number(game_id)),
    );
  }

  const games = await getGamesById([...new Set(gameIds)]);
  const gamesMap = new Map<number, Game>();

  for (const game of games) {
    if (!gamesMap.has(Number(game.id))) {
      gamesMap.set(Number(game.id), game);
    }
  }

  const returnObj = {
    data: structuredClone(gamesByPopJson) as {
      name: "wishlisted" | "played" | "24hr";
      result: PopPrimitive[];
    }[],
    gamesMap: gamesMap,
  };
  return returnObj;
};

const getGameData = async () => {
  "use cache";
  cacheLife("days");

  const multiQueryData = [] as MultiRequestDataOptions[];

  multiQueryData.push(
    {
      name: "wishlisted",
      fields: "*",
      endpoint: "popularity_primitives",
      where: `popularity_type = ${WISHLISTED_UPCOMING}`,
      sort: "value desc",
      limit: 7,
    },
    {
      name: "played",
      fields: "*",
      endpoint: "popularity_primitives",
      where: `popularity_type = ${PLAYED}`,
      sort: "value desc",
      limit: 7,
    },
    {
      name: "24hr",
      fields: "*",
      endpoint: "popularity_primitives",
      where: `popularity_type = ${PEAK_24HR}`,
      sort: "value desc",
      limit: 7,
    },
  );

  const multiUrl = new URL(getIgdbApiUrl("/multiquery"));
  const multiRequestPopData = buildMultiQueryData(multiQueryData);

  const multiRequestPopRes = await fetch(multiUrl, {
    body: multiRequestPopData,
    method: "POST",
    headers: getIgdbHeaders(),
  });

  const multiRequestPopJson = (await multiRequestPopRes.json()) as {
    name: "wishlisted" | "played" | "24hr";
    result: { game_id: number }[];
  }[];

  console.log({ multiRequestPopJson });

  const wishlistGameIds = multiRequestPopJson
    .find((m) => m.name === "wishlisted")!
    .result.map((g) => g.game_id);
  const playedGameIds = multiRequestPopJson
    .find((m) => m.name === "played")!
    .result.map((g) => g.game_id);
  const peak24hrGameIds = multiRequestPopJson
    .find((m) => m.name === "24hr")!
    .result.map((g) => g.game_id);

  const multiRequestGamesData = [];
  if (wishlistGameIds.length > 0) {
    multiRequestGamesData.push({
      name: "wishlist_games",
      endpoint: "games",
      where: `id = (${wishlistGameIds.join(",")});`,
    });
  }
  if (playedGameIds.length > 0) {
    multiRequestGamesData.push({
      name: "played_games",
      endpoint: "games",
      where: `id = (${playedGameIds.join(",")});`,
    });
  }
  if (peak24hrGameIds.length > 0) {
    multiRequestGamesData.push({
      name: "24hr_games",
      endpoint: "games",
      where: `id = (${peak24hrGameIds.join(",")});`,
    });
  }

  const dateFrom = new Date();
  const dateTo = structuredClone(dateFrom);
  dateTo.setTime(dateFrom.getTime() + 1000 * 60 * 60 * 24 * 30 * 3);
  const utsFrom = dateToUts(dateFrom);
  const utsTo = dateToUts(dateTo);
  const where = `
    release_dates.date_format.format = ("YYYYMMDD", "YYYYMM") &
    first_release_date > ${utsFrom} & first_release_date < ${utsTo} &
    hypes > 6
  `;

  multiRequestGamesData.push({
    name: "upcoming_releases",
    endpoint: "games",
    where: where,
    limit: 8,
  });

  const multiRequestGamesBody = buildMultiQueryData(multiRequestGamesData);

  console.log({ multiRequestGamesBody });

  const gameDataResponse = await fetch(multiUrl, {
    body: multiRequestGamesBody,
    method: "POST",
    headers: getIgdbHeaders(),
  });

  const gameDataJson = await gameDataResponse.json();
  return gameDataJson as {
    name:
      | "wishlist_games"
      | "played_games"
      | "24hr_games"
      | "upcoming_releases";
    result: Game[];
  }[];
};

export default async function Home() {
  // const gamesByType = await getGamesByPopularity([
  //   WISHLISTED_UPCOMING,
  //   PLAYED,
  //   PEAK_24HR,
  // ]);
  //
  // const wishlistedGames = gamesByType.data.find(
  //   (d) => d.name === "wishlisted",
  // ) as {
  //   name: "wishlisted";
  //   result: PopPrimitive[];
  // };
  // const playedGames = gamesByType.data.find((d) => d.name === "played") as {
  //   name: "played";
  //   result: PopPrimitive[];
  // };
  // const peak24hrGames = gamesByType.data.find((d) => d.name === "24hr") as {
  //   name: "24hr";
  //   result: PopPrimitive[];
  // };
  const gameData = await getGameData();
  console.log({ gameData });
  const upcomingReleases =
    gameData.find((d) => d.name === "upcoming_releases")?.result ?? [];
  const wishlistedGames =
    gameData.find((d) => d.name === "wishlist_games")?.result ?? [];
  const playedGames =
    gameData.find((d) => d.name === "played_games")?.result ?? [];
  const peak24hrGames =
    gameData.find((d) => d.name === "24hr_games")?.result ?? [];
  upcomingReleases.sort((a, b) => {
    if ("first_release_date" in a && "first_release_date" in b) {
      return (
        (a.first_release_date as number) - (b.first_release_date as number)
      );
    }
    return a.release_dates[0].date - b.release_dates[0].date;
  });

  return (
    <>
      <section className={c(styles.games_area, styles.large)}>
        <h4>Upcoming releases</h4>
        <Carousel type="grid">
          {upcomingReleases.map((game) => {
            return <GameCard key={game.id} game={game} />;
          })}
        </Carousel>
      </section>
      <section className={styles.games_area}>
        <h4>Wishlisted Games</h4>
        <Carousel>
          {wishlistedGames.map((game) => {
            return <GameCard key={game.id} game={game} />;
          })}
        </Carousel>
      </section>
      <section className={styles.games_area}>
        <h4>Played games</h4>
        <Carousel>
          {playedGames.map((game) => {
            return <GameCard key={game.id} game={game} />;
          })}
        </Carousel>
      </section>
      <section className={c(styles.games_area, styles.large)}></section>
    </>
  );
}
