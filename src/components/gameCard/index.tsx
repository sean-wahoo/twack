"use client";
import { Game } from "@/lib/types";
import Image from "next/image";
import styles from "./gameCard.module.scss";
import {
  ComponentProps,
  MouseEventHandler,
  PropsWithChildren,
  Suspense,
  useEffect,
  useState,
} from "react";
import { Tracker } from "@/prisma/generated/prisma";
import Link, { type LinkProps } from "next/link";
import { useTRPC } from "@/trpc/client";
import {
  QueryOptions,
  useQuery,
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import {
  createPlaceholderShimmer,
  getPlaceholderImageUrl,
  igdbImageLoader,
  rgbDataURL,
} from "@/lib/utils";

const GameCard: React.FC<
  ComponentProps<"a"> & {
    gameId: string;
    game?: Game;
    isLink?: boolean;
    order?: number;
    tracker?: Tracker;
    forceHideStatus?: boolean;
    direction?: "horizontal" | "vertical";
  }
> = ({
  gameId,
  game: preGame,
  onClick,
  order,
  className,
  tracker,
  isLink = true,
  forceHideStatus = false,
  direction = "horizontal",
  ...cardProps
}) => {
  // const [game, setGame] = useState<Game | undefined>(preGame);
  let releaseDate: Date | undefined;

  const hasPreGame = preGame !== undefined;

  const queryOptions = {
    enabled: !hasPreGame,
  };

  if (hasPreGame) {
    Object.defineProperty(queryOptions, "initialData", { value: [preGame] });
  }

  const trpc = useTRPC();
  let { data: gameData, status: gameStatus } = useQuery(
    trpc.igdb.getGamesById.queryOptions(
      { gameIds: [Number(gameId)] },
      queryOptions,
    ),
  );

  if (gameStatus === "error") {
    return <p>game card error?</p>;
  }
  let wrapperClassName = styles.game_search_result;
  if (className) {
    wrapperClassName += ` ${className}`;
  }

  if (gameStatus === "pending" && !hasPreGame) {
    return <Loading direction={direction} className={wrapperClassName} />;
  }

  const game = hasPreGame ? preGame : (gameData?.[0] as Game);

  if (game && "first_release_date" in game) {
    releaseDate = new Date((game.first_release_date ?? 0) * 1000);
  }
  if (game && "release_dates" in game) {
    game.release_dates.sort((a, b) => a.date - b.date);
    releaseDate = new Date(game.release_dates[0].date * 1000);
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
        <Link prefetch={false} className={className} {...props}>
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
    <Suspense
      fallback={<Loading direction={direction} className={wrapperClassName} />}
    >
      <LinkWrapper
        isLink={isLink}
        href={{
          pathname: `/games/${game.id ?? gameId}`,
        }}
        data-game-id={game.id ?? gameId}
        data-order={order}
        className={[
          wrapperClassName,
          direction === "vertical" ? styles.vertical : "",
        ].join(" ")}
        onClick={onClickWrapper}
        onNavigate={(e) => {
          if (!isLink) {
            e.preventDefault();
          }
        }}
        {...cardProps}
      >
        <Image
          loader={igdbImageLoader}
          src={game.cover.image_id}
          preload={true}
          alt={game.name}
          decoding="async"
          quality={25}
          placeholder={createPlaceholderShimmer(90, 120)}
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
            <>
              <p
                className={[
                  styles.game_tracker_status,
                  styles[tracker.status.toLowerCase()],
                ].join(" ")}
              >
                {tracker.status}
              </p>
              <p className={styles.game_platforms}>
                {direction === "horizontal"
                  ? game.platforms?.map((p) => p.abbreviation).join(", ")
                  : null}
              </p>
            </>
          ) : null}
        </div>
      </LinkWrapper>
    </Suspense>
  );
};

export const LoadingHorizontal = ({ className }: { className: string }) => {
  return (
    <span className={[className, styles.game_card_sk].join(" ")}>
      <span className={styles.image_sk} />
      <div className={styles.horizontal}>
        <span className={styles.h_sk} />
        <span className={styles.text_sk} />
      </div>
    </span>
  );
};
export const LoadingVertical = ({ className }: { className: string }) => {
  return (
    <div
      className={[className, styles.game_card_sk, styles.vertical].join(" ")}
    >
      <span className={styles.image_sk} />
      <div>
        <span className={styles.h_sk} />
        <span className={styles.text_sk} />
      </div>
    </div>
  );
};

export const Loading = ({
  className = "",
  direction = "horizontal",
}: {
  className?: string;
  direction?: "horizontal" | "vertical";
}) => {
  return direction === "horizontal" ? (
    <LoadingHorizontal className={className} />
  ) : (
    <LoadingVertical className={className} />
  );
};

export default GameCard;
