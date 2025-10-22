import { Game } from "@/lib/types";
import Image from "next/image";
import styles from "./gameCard.module.scss";
import { useTRPC } from "@/trpc/client";
import { QueryOptions, useQuery } from "@tanstack/react-query";
import { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { ComponentProps, MouseEventHandler, PropsWithChildren } from "react";
import { Tracker } from "@/prisma/generated/prisma";
import Link, { type LinkProps } from "next/link";

const GameCard: React.FC<
  ComponentProps<"a"> & {
    game: Game;
    isLink?: boolean;
    order?: number;
    tracker?: Tracker;
    forceHideStatus?: boolean;
    direction?: "horizontal" | "vertical";
  }
> = ({
  game,
  onClick,
  order,
  className,
  tracker,
  isLink = true,
  forceHideStatus = false,
  direction = "horizontal",
  ...cardProps
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
  if (direction === "vertical") {
    wrapperClassName += ` ${styles.vertical}`;
  }
  if (className) {
    wrapperClassName += ` ${className}`;
  }

  const onClickWrapper: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const LinkWrapper: React.FC<
    LinkProps & {
      isLink: boolean;
      children: React.ReactNode;
      className: string;
    }
  > = ({ isLink, children, className, ...props }) => {
    if (isLink) {
      return (
        <Link className={className} {...props}>
          {children}
        </Link>
      );
    } else {
      return (
        <span className={className} {...props}>
          {children}
        </span>
      );
    }
  };

  return (
    <LinkWrapper
      isLink={isLink}
      href={`/games/${game.id}`}
      data-game-id={game.id}
      data-order={order}
      className={wrapperClassName}
      onClick={onClickWrapper}
      onNavigate={(e) => {
        if (!isLink) {
          e.preventDefault();
        }
      }}
      {...cardProps}
    >
      <Image
        src={
          direction === "horizontal"
            ? game.cover.url
            : game.cover.url.replace("small", "big")
        }
        decoding="async"
        alt={game.name}
        priority={true}
        width={90}
        height={120}
      />
      <div>
        <h6 className={styles.game_name}>{game.name}</h6>
        {/* <p className={styles.game_release_date}> */}
        {/*   {direction === "horizontal" && releaseDate */}
        {/*     ? releaseDate.toLocaleDateString() */}
        {/*     : null} */}
        {/* </p> */}
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
          {direction === "horizontal"
            ? game.platforms?.map((p) => p.abbreviation).join(", ")
            : null}
        </p>
      </div>
    </LinkWrapper>
  );
};

export default GameCard;
