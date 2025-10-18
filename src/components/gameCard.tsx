import { Game } from "@/lib/types";
import Image from "next/image";
import styles from "./gameCard.module.scss";
import { useTRPC } from "@/trpc/client";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { TRPCQueryOptions } from "@trpc/tanstack-react-query";

const GameCard: React.FC<{
  game: Game;
  onClick?: React.MouseEventHandler;
}> = ({ game, onClick }) => {
  // const trpc = useTRPC();
  // const queryOpts: any = {
  //   enabled: game === undefined
  // };
  // if (game) {
  //   queryOpts.initialData = {
  //     games: [game],
  //   };
  // }
  // const getGameByIdQuery = useQuery(
  //   trpc.igdb.getGamesById.queryOptions(
  //     {
  //       gameIds: [gameId],
  //     },
  //     queryOpts,
  //   ),
  // );
  let releaseDate: Date | undefined;
  if ("first_release_date" in game) {
    releaseDate = new Date((game.first_release_date ?? 0) * 1000);
  }
  if ("release_dates" in game) {
    game.release_dates.sort((a, b) => a.date - b.date);
    releaseDate = new Date(game.release_dates[0].date * 1000);
  }

  return (
    <span
      data-game-id={game.id}
      className={styles.game_search_result}
      key={game.id}
      onClick={onClick}
    >
      <Image
        src={game.cover.url}
        decoding="async"
        alt={game.name}
        width={90}
        height={120}
      />
      <div>
        <h6 className={styles.game_name}>{game.name}</h6>
        <p className={styles.game_release_date}>
          {releaseDate ? releaseDate.toLocaleDateString() : "idk when lol"}
        </p>
        <p className={styles.game_platforms}>
          {game.platforms?.map((p) => p.abbreviation).join(", ")}
        </p>
      </div>
    </span>
  );
};

export default GameCard;
