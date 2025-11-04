import z from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "../init";
import { parseGame, type Game } from "@/lib/types";
import {
  buildRequestData,
  getIgdbApiUrl,
  getIgdbHeaders,
  queryGameFields,
  trpcErrorHandling,
} from "@/lib/utils";

const getIgdbToken = baseProcedure.query(async (opts) => {
  try {
    const url = new URL(
      process.env.TWITCH_AUTH_URL ?? "https://id.twitch.tv/oauth2/token",
    );
    url.searchParams.append("client_id", process.env.TWITCH_CLIENT_ID ?? "");
    url.searchParams.append(
      "client_secret",
      process.env.TWITCH_CLIENT_SECRET ?? "",
    );
    url.searchParams.append("grant_type", "client_credentials");
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    return { data: { access_token: data.access_token } };
  } catch (e) {
    throw trpcErrorHandling(e);
  }
});

const getGames = baseProcedure.query(async () => {
  const games = [];
  try {
    const url = getIgdbApiUrl("/games");
    const now = new Date();

    const yearStart = new Date(now.getFullYear().toString()).getTime() / 1000;

    const requestData = buildRequestData({
      fields: queryGameFields,
      where: `language_supports.language.locale = "en-US" & rating > 50 & first_release_date > ${yearStart}`,
      sort: "rating desc",
      limit: 50,
    });

    const gamesResponse = await fetch(url, {
      body: requestData,
      method: "POST",
      headers: getIgdbHeaders(),
    });

    const gamesJson = await gamesResponse.json();

    for (const game of gamesJson) {
      const parsedGame = parseGame(game);
      games.push(parsedGame as Game);
    }
    return games;
  } catch (e) {
    throw trpcErrorHandling(e);
  }
});

const getGamesSearch = baseProcedure
  .input(
    z.object({
      search: z.string(),
      type: z.optional(z.string()),
      limit: z.optional(z.number()),
    }),
  )
  .query(async ({ input }) => {
    try {
      const url = getIgdbApiUrl("/search");
      const { search, limit = 5 } = input;

      const requestData = buildRequestData({
        fields: queryGameFields,
        // search: `*"${search}"*`,
        // where: "game != null",
        where: `game != null & game.game_type.type = ("Main Game", "Expanded Game", "Standalone Expansion", "DLC") & game.name ~ *"${search}"*`,
        limit: limit,
        prefix: "game",
      });

      console.log({ requestData });
      const gamesSearchResponse = await fetch(url, {
        body: requestData,
        method: "POST",
        headers: getIgdbHeaders(),
      });
      const gamesSearchJson = await gamesSearchResponse.json();
      console.log({ gamesSearchJson });

      const games: Game[] = [];
      for (const result of gamesSearchJson) {
        if (!result.game || !result.game.cover) {
          continue;
        }
        const parsedGame = parseGame(result.game);
        games.push(parsedGame);
      }

      games.sort((gameA, gameB) => {
        let weightA = 0,
          weightB = 0;
        if ("rating" in gameA) {
          weightA = gameA.rating ?? 0;
          if ("rating_count" in gameA) {
            weightA += gameA.rating_count ?? 0;
          }
        }
        if ("rating" in gameB) {
          weightB = gameB.rating ?? 0;
          if ("rating_count" in gameB) {
            weightB += gameB.rating_count ?? 0;
          }
        }
        return weightB - weightA;
      });

      return games;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const getGamesById = baseProcedure
  .input(
    z.object({
      gameIds: z.array(z.number()),
      limit: z.optional(z.number()),
    }),
  )
  .query(async ({ input }) => {
    try {
      const url = getIgdbApiUrl("/games");
      const gameIds = input.gameIds;
      if (!gameIds.length) {
        throw new TRPCError({
          code: "PARSE_ERROR",
          message: "game ids array cannot be empty",
        });
      }
      const requestData = buildRequestData({
        fields: queryGameFields,
        where: `id = (${gameIds.join(",")})`,
        limit: input.limit ?? gameIds.length,
      });
      const gamesByIdResponse = await fetch(url, {
        method: "POST",
        body: requestData,
        headers: getIgdbHeaders(),
      });
      const gamesByIdJson = await gamesByIdResponse.json();

      const games = [];
      for (const result of gamesByIdJson ?? []) {
        const parsedGame = parseGame(result);
        games.push(parsedGame);
      }
      return games;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

const getScreenshotsByGameId = baseProcedure
  .input(
    z.object({
      gameId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    try {
      const { gameId } = input;
      const url = getIgdbApiUrl("/screenshots");

      const requestData = buildRequestData({
        fields: ["screenshots.*"],
        where: `game = ${gameId}`,
      });

      console.log({ requestData });
      const ssByGameIdResponse = await fetch(url, {
        method: "POST",
        body: requestData,
        headers: getIgdbHeaders(),
      });

      const ssByGameIdJson = await ssByGameIdResponse.json();

      console.log({ ssByGameIdJson });
      return ssByGameIdJson;
    } catch (e) {
      throw trpcErrorHandling(e);
    }
  });

export const igdbRouter = createTRPCRouter({
  getIgdbToken,
  getGames,
  getGamesSearch,
  getGamesById,
  getScreenshotsByGameId,
});
