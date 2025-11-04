import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import type { NextPage } from "next";
import GameArea, { GameHeaderLoading } from "./gameArea";
import styles from "./gamePage.module.scss";
import { Suspense } from "react";
import {
  buildRequestData,
  getIgdbApiUrl,
  getIgdbHeaders,
  queryGameFields,
} from "@/lib/utils";
import { Game, parseGame } from "@/lib/types";
import { cacheLife, cacheTag } from "next/cache";
import GamePageLoading from "./loading";

const getGame = async (gameId: string) => {
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

const gamePage: NextPage<{ params: Promise<{ gameId: string }> }> = async ({
  params,
}) => {
  "use cache";
  cacheLife("days");

  const { gameId } = await params;

  const game = await getGame(gameId);

  return (
    <>
      <GameArea game={game} />
    </>
  );
};

export default gamePage;
