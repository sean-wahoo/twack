import { Game } from "@/lib/types";
import Image from "next/image";
import styles from "./gameCard.module.scss";
import { useTRPC } from "@/trpc/client";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { ComponentProps } from "react";
import { Tracker } from "@/prisma/generated/prisma";

const GameCard: React.FC<
  ComponentProps<"span"> & {
    game: Game;
    order?: number;
    tracker?: Tracker;
    forceHideStatus?: Boolean;
  }
> = ({
  game,
  onClick,
  order,
  className,
  tracker,
  forceHideStatus = false,
  ...spanProps
}) => {
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

  let wrapperClassName = styles.game_search_result;
  if (className) {
    wrapperClassName += ` ${className}`;
  }

  return (
    <span
      data-game-id={game.id}
      data-order={order}
      className={wrapperClassName}
      key={game.id}
      onClick={onClick}
      {...spanProps}
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
        {tracker && !forceHideStatus ? (
          <p
            className={[
              styles.game_tracker_status,
              styles[tracker.status.toLowerCase()],
            ].join(" ")}
          >
            {tracker.status}
          </p>
        ) : null}
        <p className={styles.game_platforms}>
          {game.platforms?.map((p) => p.abbreviation).join(", ")}
        </p>
      </div>
    </span>
  );
};

export default GameCard;
