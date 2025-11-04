import { Prisma } from "@/prisma/generated/prisma";
import { TRPCError } from "@trpc/server";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { ImageLoaderPropsWithConfig } from "next/dist/shared/lib/image-config";
import { ImageLoader } from "next/image";

export const utsToDate = (uts: number) => {
  return new Date(uts * 1000);
};

export const dateToUts = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};

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
    console.log({ e });
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
  where: string;
  sort?: string;
  limit?: number;
  search?: string;
  fields?: string[];
  prefix?: string;
}
export const buildRequestData: (opts: RequestDataOptions) => string = ({
  where,
  sort,
  search,
  fields = queryGameFields,
  limit = 50,
  prefix = "",
}) => {
  prefix = prefix.length > 0 ? prefix + "." : "";
  const mappedFields = fields.map((f) => prefix + f).join(",");

  let requestDataString = `
      fields ${mappedFields};
      where ${where};
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
export const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

export const isOverflowing = (e: Element) => {
  if (!e.parentElement) {
    return false;
  }
  return e.scrollWidth > e.clientWidth;
};

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

export const rgbDataURL = (r: number, b: number, g: number) => {
  const triplet1 = triplet(0, r, g);
  const triplet2 = triplet(b, 255, 255);

  const url = `data:idata:image/gif;base64,R0lGODlhAQABAPAA${triplet1 + triplet2}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;
  return url;
};

export const getPlaceholderImageUrl = (
  imageUrl: string,
  height: number = 120,
  width: number = 90,
) => {
  return `/_next/image/?url=${encodeURIComponent(imageUrl)}&q=1&w=${width}&h=${height}`;
};

// export const getSrcSet = (url: string) => {
//
// }
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

export const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const createPlaceholderShimmer: (
  w: number,
  h: number,
) => PlaceholderValue = (w, h) => {
  return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
};

export const igdbImageLoader: ImageLoader = ({
  src: imageId,
  quality,
  width,
}) => {
  const baseUrl =
    process.env.IGDB_IMAGE_URL || "https://images.igdb.com/igdb/image/upload";

  let newQuality = "t_";
  switch (quality) {
    case 1:
      newQuality += "micro";
      break;
    default:
    case 25:
      newQuality += "cover_small";
      break;
    case 50:
      newQuality += "screenshot_med";
      break;
    case 75:
      newQuality += "720p";
      break;
    case 100:
      newQuality += "1080p";
      break;
  }

  const igdbUrl = `${baseUrl}/${newQuality}/${imageId}.jpg`;
  return `/_next/image?url=${encodeURIComponent(igdbUrl)}&w=${width}&q=${quality}`;
};
