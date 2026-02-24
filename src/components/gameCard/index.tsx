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
import { Tracker } from "@/prisma/generated/prisma/client";
import Link, { type LinkProps } from "next/link";
import { useTRPC } from "@/trpc/client";
import {
  QueryOptions,
  useQuery,
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import {
  c,
  createPlaceholderShimmer,
  getGameCardImage,
  getGamePlatformIcons,
  igdbImageLoader,
} from "@/lib/utils";
import { useRouter } from "next/navigation";

const GameCard: React.FC<
  ComponentProps<"div"> & {
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
  let releaseDate: Date | undefined;
  let wrapperClassName = styles.game_card;
  if (className) {
    wrapperClassName += ` ${className}`;
  }

  if ("release_dates" in game) {
    game.release_dates.sort((a, b) => a.date - b.date);
    releaseDate = new Date(game.release_dates[0].date * 1000);
  }
  if ("first_release_date" in game) {
    releaseDate = new Date((game.first_release_date ?? 0) * 1000);
  }

  const router = useRouter();
  const onClickWrapper: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (isLink) {
      router.push(`/games/${game.id}`);
    }
  };

  if (game.release_dates?.length === 0) {
    console.log({ game });
  }

  return (
    <div
      data-game-id={game.id}
      data-order={order}
      className={c(wrapperClassName)}
      onClick={onClickWrapper}
      tabIndex={0}
      {...cardProps}
    >
      {"cover" in game ? (
        <div className={c(styles.img_container, styles[direction])}>
          <Image
            loader={igdbImageLoader}
            src={getGameCardImage(game) as string}
            preload={true}
            alt={game.name}
            decoding="async"
            quality={100}
            placeholder={createPlaceholderShimmer(90, 120)}
            width={direction === "vertical" ? 90 : 240}
            height={direction === "vertical" ? 120 : 135}
            // fill={true}
          />
          <div className={styles.game_card_img_overlay} />
        </div>
      ) : null}
      <div className={styles.game_info}>
        <main>
          <p className={styles.game_name}>{game.name}</p>
          {game.franchise ? <p>{game.franchise.name}</p> : null}
        </main>
        {/* {game.platforms */}
        {/*   ?.sort((a, b) => a.generation - b.generation) */}
        {/*   .slice(0, 2) */}
        {/*   .map((platform) => { */}
        {/*     return ( */}
        {/*       <p>{platform.abbreviation}</p> */}
        {/*       // <Image */}
        {/*       //   loader={igdbImageLoader} */}
        {/*       //   src={platform.platform_logo.image_id} */}
        {/*       //   alt={platform.abbreviation} */}
        {/*       //   width={12} */}
        {/*       //   height={12} */}
        {/*       // /> */}
        {/*     ); */}
        {/*   })} */}
        <footer>
          {game.release_dates?.[0].date ? (
            <p className={styles.release_date}>
              {releaseDate?.toLocaleDateString()}
            </p>
          ) : null}
          <div className={styles.game_platforms}>
            {getGamePlatformIcons(game)}
          </div>
        </footer>
      </div>
    </div>
  );
};

export const LoadingHorizontal = ({ className }: { className: string }) => {
  return (
    <span
      className={c(
        styles.game_card,
        styles.horizontal,
        styles.game_card_sk,
        className,
      )}
    >
      <span className={styles.image_sk} />
      <div>
        <span className={styles.h_sk} />
        <span className={styles.text_sk} />
        <span className={styles.text_sk} />
        <footer>
          <span className={styles.text_sk} />
        </footer>
      </div>
    </span>
  );
};
export const LoadingVertical = ({ className }: { className: string }) => {
  return (
    <div
      className={c(
        styles.game_card,
        styles.vertical,
        styles.game_card_sk,
        className,
      )}
    >
      <span className={styles.image_sk} />
      <div>
        <span className={styles.h_sk} />
        <footer>
          <span className={styles.text_sk} />
        </footer>
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
