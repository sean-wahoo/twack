import { Prisma } from "@/prisma/generated/prisma";
import { TRPCError } from "@trpc/server";

export const clickInRect = (rect: DOMRect, event: MouseEvent) =>
  rect.top <= event.clientY &&
  event.clientY <= rect.top + rect.height &&
  rect.left <= event.clientX &&
  event.clientX <= rect.left + rect.width;

export const slugify = (str: string, sep = "-") => {
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/\\s+/g, sep)
      .replace(/[^\w\\-]/g, "")
      .replace(/\\-\\-+/g, sep)
      .replace(/\\-$/g, "") +
    "_" +
    Math.random().toString(36).substring(7, 15)
  );
};

export function debounce<T extends unknown[], U>(
  callback: (...args: T) => PromiseLike<U> | U,
  wait: number,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: T): Promise<U> => {
    if (timer) clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => {
        resolve(callback(...args));
      }, wait);
    });
  };
}

export const trpcErrorHandling = (e: unknown) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-known-request-error",
      cause: e,
    });
  }
  if (e instanceof Prisma.PrismaClientUnknownRequestError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-unknown-request-error",
      cause: e,
    });
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-initialization-error",
      cause: e,
    });
  }
  if (e instanceof Prisma.PrismaClientValidationError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-validation-error",
      cause: e,
    });
  }
  if (e instanceof Prisma.PrismaClientRustPanicError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-rust-panic-error",
      cause: e,
    });
  }
  if (!(e instanceof TRPCError)) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "idk man",
      cause: e,
    });
  } else {
    return e as TRPCError;
  }
};
export const queryGameFields = [
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
  "aggregated_rating",
  "aggregated_rating_count",
  "total_rating",
  "first_release_date",
  "id",
  "summary",
  "storyline",
  "artworks.animated",
  "artworks.artwork_type.name",
  "artworks.artwork_type.slug",
  "artworks.height",
  "artworks.width",
  "artworks.image_id",
  "artworks.url",
  "screenshots.*",
];

export const getIgdbApiUrl: (endpoint: string) => URL = (endpoint: string) => {
  const baseUrl = process.env.IGDB_API_URL ?? "https://api.igdb.com/v4";
  if (!endpoint.startsWith("/")) {
    endpoint = `/${endpoint}`;
  }
  const url = new URL(baseUrl + endpoint);
  return url;
};
export const getIgdbHeaders: () => Headers = () => {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${process.env.IGDB_ACCESS_TOKEN}`);
  headers.append("Accept", "application/json");
  headers.append("Client-ID", process.env.TWITCH_CLIENT_ID ?? "");
  return headers;
};

interface RequestDataOptions {
  fields: string[];
  where: string;
  sort?: string;
  limit?: number;
  search?: string;
}
export const buildRequestData: (opts: RequestDataOptions) => string = ({
  fields,
  where,
  sort,
  search,
  limit = 50,
}) => {
  let requestDataString = `
      fields ${fields.join(",")};
      where (${where});
    `;

  if (search) {
    requestDataString += `search ${search};`;
  }
  if (sort) {
    requestDataString += `sort ${sort};`;
  }

  requestDataString += `limit ${limit};`;

  return requestDataString.replace(/\n/g, "").trim();
};
