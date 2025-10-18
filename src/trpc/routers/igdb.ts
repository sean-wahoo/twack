import z from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure, createTRPCRouter } from "../init";
import { parseGame, type Game } from "@/lib/types";

const queryGameFields = [
  "name",
  "version_title",
  "parent_game",
  "hypes",
  "keywords.name",
  "keywords.slug",
  "genres.slug",
  "genres.name",
  "game_type.type",
  "cover.url",
  "cover.height",
  "cover.width",
  "cover.image_id",
  "franchise.name",
  "franchise.slug",
  "franchise.url",
  "platforms.abbreviation",
  "platforms.name",
  "platforms.slug",
  "version_title",
  "release_dates.date",
  "release_dates.human",
  "release_dates.status.name",
  "release_dates.y",
  "age_ratings.rating_cover_url",
  "age_ratings.rating_category.rating",
  "similar_games",
  "rating",
  "rating_count",
  "first_release_date",
  "total_rating",
  "id",
];

const querySearchFields = [];

const getIgdbToken = baseProcedure.query(async (opts) => {
  const url = new URL(
    process.env.TWITCH_AUTH_URL ?? "https://id.twitch.tv/oauth2/token",
  );
  url.searchParams.append("client_id", process.env.TWITCH_CLIENT_ID ?? "");
  url.searchParams.append(
    "client_secret",
    process.env.TWITCH_CLIENT_SECRET ?? "",
  );
  url.searchParams.append("grant_type", "client_credentials");
  try {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    return { data: { access_token: data.access_token } };
  } catch (e) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "couldn't get your access token loser!",
    });
  }
});

const getGames = baseProcedure.query(async () => {
  const baseUrl = process.env.IGDB_API_URL ?? "https://api.igdb.com/v4";
  const url = new URL(baseUrl + "/multiquery");
  const now = new Date();

  const yearStart = new Date(now.getFullYear().toString()).getTime() / 1000;
  const requestData = `
    query games "games" {
      fields ${queryGameFields.join(",")};
      where language_supports.language.locale = "en-US" & rating > 50 & first_release_date > ${yearStart};
      sort rating desc;
      limit 50;
    };
  `;

  const gamesResponse = await fetch(url, {
    body: requestData,
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
      Accept: "application/json",
      "Client-ID": process.env.TWITCH_CLIENT_ID ?? "",
    },
  });

  const gamesJson = await gamesResponse.json();

  console.log({ gamesJson });

  const returnObj: {
    games: Game[];
  } = {
    games: [],
  };
  for (const game of gamesJson[0].result) {
    const parsedGame = parseGame(game);
    returnObj.games.push(parsedGame as Game);
  }
  return returnObj;
});

const getGamesSearch = baseProcedure
  .input(
    z.object({
      search: z.string(),
      type: z.optional(z.string()),
    }),
  )
  .query(async ({ input, ctx }) => {
    const baseUrl = process.env.IGDB_API_URL ?? "https://api.igdb.com/v4";
    const url = new URL(baseUrl + "/search");
    const searchInput = input.search;
    const str = queryGameFields.map((f) => `game.${f}`).join(",");
    const requestData = `
    fields ${str};
    search *"${searchInput}"*;
    where game != null & game.game_type.type = ("Main Game", "Expanded Game");
    limit 12;
  `;

    const gamesSearchResponse = await fetch(url, {
      body: requestData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID ?? "",
      },
    });
    const gamesSearchJson = await gamesSearchResponse.json();
    console.log({ gamesSearchJson });
    const returnObj: { games: Game[] } = { games: [] };
    for (const result of gamesSearchJson) {
      console.log({ result: result.game });
      if (!result.game || !result.game.cover) {
        continue;
      }

      const parsedGame = parseGame(result.game);

      returnObj.games.push(parsedGame);
    }

    returnObj.games.sort((gameA, gameB) => {
      let weightA = 0,
        weightB = 0;
      if ("rating" in gameA) {
        weightA = gameA.rating;
        if ("rating_count" in gameA) {
          weightA += gameA.rating_count ?? 0;
        }
      }
      if ("rating" in gameB) {
        weightB = gameB.rating;
        if ("rating_count" in gameB) {
          weightB += gameB.rating_count ?? 0;
        }
      }
      return weightB - weightA;
    });
    console.log({ r: returnObj.games, i: input });

    return returnObj;
  });

const getGamesById = baseProcedure
  .input(
    z.object({
      gameIds: z.array(z.string()),
    }),
  )
  .query(async ({ input }) => {
    const baseUrl = process.env.IGDB_API_URL ?? "https://api.igdb.com/v4";
    const url = new URL(baseUrl + "/games");
    const gameIds = input.gameIds;
    const str = queryGameFields.join(",");
    const requestData = `
      fields ${str};
      where id = (${gameIds.join(",")});
      limit ${gameIds.length};
    `;
    console.log({ requestData });
    const gamesByIdResponse = await fetch(url, {
      method: "POST",
      body: requestData,
      headers: {
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID ?? "",
      },
    });
    const gamesByIdJson = await gamesByIdResponse.json();

    const returnObj: { games: Game[] } = { games: [] };
    for (const result of gamesByIdJson) {
      const parsedGame = parseGame(result);
      returnObj.games.push(parsedGame);
    }
    return returnObj;
  });

export const igdbRouter = createTRPCRouter({
  getIgdbToken,
  getGames,
  getGamesSearch,
  getGamesById,
});
