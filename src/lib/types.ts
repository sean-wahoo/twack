import { Like, Review, User } from "@/prisma/generated/prisma/client";

export type Game = {
  id: string;
  hypes: number;
  genres: {
    name: string;
    slug: string;
  }[];
  cover: {
    id: string;
    image_id: string;
    url: string;
    width: number;
    height: number;
  };
  extra_covers?: {
    id: string;
    image_id: string;
    url: string;
    width: number;
    height: number;
  }[];
  game_type: string;
  keywords: {
    name: string;
    slug: string;
  }[];
  name: string;
  rating?: number;
  rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  total_rating?: number;
  platforms?: {
    name: string;
    abbreviation: string;
    slug: string;
    platform_logo: { image_id: string };
    generation: number;
  }[];
  franchise?: {
    name: string;
  };
  similar_games?: number[];
  first_release_date?: number;
  summary?: string;
  storyline?: string;
  screenshots?: {
    id: string;
    game: string;
    width: number;
    height: number;
    image_id: string;
    url: string;
  }[];
  release_dates: {
    id: string;
    name: string;
    date: number;
    human: string;
    y: string;
  }[];
  artworks?: {
    animated: true;
    artwork_type: {
      name: string;
      slug: string;
    };
    width: number;
    height: number;
    image_id: string;
    url: string;
  }[];
};

export const parseGame: (rawGameObj: any) => Game = (rawGameObj) => {
  let returnObj: any = {
    id: rawGameObj.id.toString(),
    name: rawGameObj.name,
    hypes: rawGameObj.hypes ?? 0,
    game_type: rawGameObj.game_type.type ?? "Main game",
    rating: rawGameObj.rating ?? 0,
    rating_count: rawGameObj.rating_count ?? 0,
    aggregated_rating: rawGameObj.aggregated_rating ?? 0,
    aggregated_rating_count: rawGameObj.aggregated_rating_count ?? 0,
    total_rating: rawGameObj.total_rating ?? 0,
    first_release_date: rawGameObj.first_release_date,
  };

  if ("cover" in rawGameObj) {
    returnObj.cover = {
      ...rawGameObj.cover,
      url: "https:" + rawGameObj.cover?.url.replace("thumb", "cover_small"),
    };
  }
  if ("platforms" in rawGameObj) {
    returnObj.platforms = rawGameObj.platforms;
  }
  if ("release_dates" in rawGameObj) {
    returnObj.release_dates = rawGameObj.release_dates;
  }
  if ("similar_games" in rawGameObj) {
    returnObj.similar_games = rawGameObj.similar_games;
  }
  if ("genres" in rawGameObj) {
    returnObj.genres = rawGameObj.genres;
  }
  if ("summary" in rawGameObj) {
    returnObj.summary = rawGameObj.summary;
  }
  if ("storyline" in rawGameObj) {
    returnObj.storyline = rawGameObj.storyline;
  }
  if ("franchise" in rawGameObj) {
    returnObj.franchise = rawGameObj.franchise;
  }
  if ("artworks" in rawGameObj) {
    returnObj.artworks = rawGameObj.artworks.map((a: any) => {
      return {
        ...a,
        url: "http:" + a.url.replace("thumb", "1080p"),
      };
    });
  }
  if ("screenshots" in rawGameObj) {
    returnObj.screenshots = rawGameObj.screenshots.map((s: any) => {
      return {
        ...s,
        url: "http:" + s.url.replace("thumb", "cover_big"),
      };
    });
  }

  return returnObj as Game;
};

export type PopPrimitive = {
  calculated_at: number;
  created_at: number;
  external_popularity_source: number;
  game_id: number;
  id: number;
  popularity_type: number;
  updated_at: number;
  value: number;
};

export interface SafeReview extends Omit<Review, "rating"> {
  user: Pick<User, "image" | "name" | "id">;
  // ratingAsNumber: number;
}
