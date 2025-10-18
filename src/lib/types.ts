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
  game_type: string;
  keywords: {
    name: string;
    slug: string;
  }[];
  name: string;
  rating: number;
  rating_count?: number;
  total_rating?: number;
  platforms?: { name: string; abbreviation: string; slug: string }[];
  similar_games?: string[];
  first_release_date?: number;
  release_dates: {
    id: string;
    name: string;
    date: number;
    human: string;
    y: string;
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
    total_rating: rawGameObj.total_rating ?? 0,
    first_release_date: rawGameObj.first_release_date,
  };

  if ("cover" in rawGameObj) {
    returnObj.cover = {
      ...rawGameObj.cover,
      url: "http:" + rawGameObj.cover?.url.replace("thumb", "cover_small"),
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

  return returnObj as Game;
};
