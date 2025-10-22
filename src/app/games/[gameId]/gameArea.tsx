"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import styles from "./gamePage.module.scss";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Button from "@/components/button";
import { useEffect, useRef, useState } from "react";
import { Game } from "@/lib/types";

const GameArea: React.FC<{ game: Game }> = ({ game }) => {
  const trpc = useTRPC();

  const [showDesc, setShowDesc] = useState<boolean>(false);

  let releaseDateUnixTs =
    "first_release_date" in game
      ? game.first_release_date
      : game.release_dates[0].date;

  let releaseDate: Date | undefined;

  if (releaseDateUnixTs !== undefined) {
    releaseDate = new Date((releaseDateUnixTs ?? 0) * 1000);
  }

  const { data: session, status } = useSession();
  const { data: trackersData, status: trackersStatus } = useQuery(
    trpc.tracker.getTrackersByUserId.queryOptions(
      { userId: session!.user.id },
      {
        enabled: status === "authenticated",
      },
    ),
  );

  const { data: collectionsData, status: collectionsStatus } = useQuery(
    trpc.collection.getAuthedUserCollections.queryOptions(undefined, {
      enabled: status === "authenticated",
    }),
  );

  const { data: reviewsData, status: reviewsStatus } = useQuery(
    trpc.review.getReviewsByUserId.queryOptions(
      { userId: session?.user.id as string },
      {
        enabled: status === "authenticated",
      },
    ),
  );

  const gameButtons = () => {
    if (status !== "authenticated") {
      return;
    }
    const showTrackerButton =
      status === "authenticated" &&
      trackersStatus === "success" &&
      !trackersData?.find((tracker) => tracker.gameId === game.id);

    const showBookmarkButton =
      status === "authenticated" &&
      collectionsStatus === "success" &&
      !collectionsData?.find((c) => c.gameIds.includes(game.id));

    const showReviewButton =
      status === "authenticated" &&
      reviewsStatus === "success" &&
      !reviewsData?.find((review) => review.gameId === game.id);
    const addTrackerButton = (
      <Button className={styles.tracker} disabled={!showTrackerButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
          />
        </svg>
      </Button>
    );
    const addBookmarkButton = (
      <Button className={styles.bookmark} disabled={!showBookmarkButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
          />
        </svg>
      </Button>
    );

    const addReviewButton = (
      <Button className={styles.review} disabled={!showReviewButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      </Button>
    );

    return (
      <div className={styles.game_buttons_area}>
        {addTrackerButton}
        {addBookmarkButton}
        {addReviewButton}
      </div>
    );
  };

  const summaryRef = useRef<HTMLSpanElement>(null);
  const summaryMoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const responsiveMoreButton: (this: Window, e: UIEvent) => void = () => {
      if (summaryRef.current) {
        if (
          (summaryRef.current.offsetHeight < summaryRef.current.scrollHeight ||
            summaryRef.current.offsetWidth > summaryRef.current.scrollWidth) &&
          summaryMoreRef.current
        ) {
          summaryMoreRef.current!.style.display = "block";
        } else {
          summaryMoreRef.current!.style.display = "none";
        }
      }
    };

    responsiveMoreButton.call(window, {} as UIEvent);

    if (typeof window !== "undefined") {
      window.addEventListener("resize", responsiveMoreButton);
      return () => window.removeEventListener("resize", responsiveMoreButton);
    }
  }, []);

  const gameSummary = () => {
    const onShowClick: React.MouseEventHandler<HTMLSpanElement> = () => {
      setShowDesc(!showDesc);
      if (summaryRef.current) {
        summaryRef.current.scrollTo(0, 0);
      }
    };
    return (
      <>
        <span
          ref={summaryRef}
          className={[styles.summary, showDesc ? styles.more : null].join(" ")}
        >
          {game.summary}
        </span>
        <span
          ref={summaryMoreRef}
          className={styles.summary_show}
          onClick={onShowClick}
        >
          show {showDesc ? "less" : "more"}
        </span>
      </>
    );
  };

  const gameRatings = () => {
    const generalRatings = (
      <div className={styles.general_ratings}>
        <span>
          {game.aggregated_rating ? game.aggregated_rating.toFixed(2) : "--"}
        </span>
        <hr />
        <span>100</span>
        <p>external score</p>
      </div>
    );
    const igdbRatings = (
      <div className={styles.igdb_ratings}>
        <span>{game.rating ? game.rating.toFixed(2) : "--"}</span>
        <hr />
        <span>100</span>
        <p>IGDB score</p>
      </div>
    );
    const totalRatings = (
      <div className={styles.total_ratings}>
        <span>{game.total_rating ? game.total_rating.toFixed(2) : "--"}</span>
        <hr />
        <span>100</span>
        <p>total score</p>
      </div>
    );
    return (
      <span className={styles.ratings_area}>
        {generalRatings} {totalRatings} {igdbRatings}
      </span>
    );
  };

  const mainArtwork = game.artworks?.[0];
  return (
    <section className={styles.game_section}>
      <header data-main-artwork-url={mainArtwork?.url}>
        {mainArtwork ? (
          <Image
            src={mainArtwork.url}
            width={mainArtwork.width}
            height={mainArtwork.height}
            alt={mainArtwork.image_id}
            className={styles.game_main_artwork}
          />
        ) : null}
        <div className={styles.image_area}>
          <Image
            src={game.cover.url.replace("small", "big")}
            alt={game.name}
            width={210}
            height={280}
          />
          {gameButtons()}
        </div>
        <div>
          <h1>{game.name}</h1>
          <div>{gameSummary()}</div>
        </div>
      </header>
      <main className={styles.game_main_area}>
        <div className={styles.info_area}>{gameRatings()}</div>
      </main>
    </section>
  );
};

export default GameArea;
const cachedGameArea: React.FC<{ gameId: string }> = async ({ gameId }) => {
  // const
};
