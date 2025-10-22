import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import type { NextPage } from "next";
import GameArea from "./gameArea";
import styles from "./gamePage.module.scss";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  buildRequestData,
  getIgdbApiUrl,
  getIgdbHeaders,
  queryGameFields,
} from "@/lib/utils";
import { Game, parseGame } from "@/lib/types";
import { cacheLife } from "next/cache";

const gamePage: NextPage<{ params: Promise<{ gameId: string }> }> = async ({
  params,
}) => {
  const { gameId } = await params;
  const game = await getGame(gameId);
  console.log({ game });

  return (
    <HydrateClient>
      <main className={styles.main_game_area}>
        <ErrorBoundary fallback={<p>error!</p>}>
          {/* <Suspense fallback={<p>loading...</p>}> */}
          {/* <GameArea gameId={gameId} /> */}
          <GameArea game={game} />
          {/* </Suspense> */}
        </ErrorBoundary>
      </main>
    </HydrateClient>
  );
};

export default gamePage;

const getGame = async (gameId: string) => {
  "use cache";
  cacheLife("days");
  const url = new URL(getIgdbApiUrl("/games"));
  const requestData = buildRequestData({
    fields: queryGameFields,
    where: `id = ${gameId}`,
  });

  const gameRes = await fetch(url, {
    method: "POST",
    body: requestData,
    headers: getIgdbHeaders(),
  });

  const gameJson = await gameRes.json();
  const parsedGame = parseGame(gameJson[0]);
  return parsedGame;
};
