"use client";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import styles from "./gamePage.module.scss";
import Image from "next/image";
import { useSession } from "@/lib/auth/client";
import Button from "@/components/button";
import {
  FormEventHandler,
  Suspense,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Game } from "@/lib/types";
import Dialog from "@/components/dialog";
import { TrackerStatus } from "@/prisma/generated/prisma";
import {
  addReviewFormAction,
  addTrackerFormAction,
  editGameCollections,
  TrackerFormState,
} from "@/lib/actions";
import {
  collectionIcon,
  likeIcon,
  reviewIcon,
  trackerIcon,
} from "@/lib/svgIcons";
import Review from "@/components/review";
import GameCard, { Loading as GameCardLoading } from "@/components/gameCard";
import Carousel from "@/components/carousel";
import ReviewsArea from "./reviewsArea";
import { createPlaceholderShimmer, igdbImageLoader } from "@/lib/utils";
import MultiSelect from "@/components/multiselect";

const GameArea: React.FC<{ game: Game }> = ({ game }) => {
  const trpc = useTRPC();

  const [showDesc, setShowDesc] = useState<boolean>(false);
  const addTrackerDialogRef = useRef<HTMLDialogElement>(null);
  const addReviewDialogRef = useRef<HTMLDialogElement>(null);
  const addToCollectionDialogRef = useRef<HTMLDialogElement>(null);

  const queryClient = useQueryClient();

  const { data: session } = useSession();

  let releaseDate: Date | undefined;

  if (releaseDateUnixTs !== undefined) {
    releaseDate = new Date((releaseDateUnixTs ?? 0) * 1000);
  }

  const { data: session, status } = useSession();

  const { data: trackersData, status: trackersStatus } = useSuspenseQuery(
    trpc.tracker.getTrackersByUserId.queryOptions(
      { userId: `${session?.userId}` },
      {
        enabled: !!session?.userId,
      },
    ),
  );

  const getTrackersKey = trpc.tracker.getTrackersByUserId.queryKey();

  const { data: authedCollections, status: authedCollectionsStatus } = useQuery(
    trpc.collection.getAuthedUserCollections.queryOptions(
      { getGames: true },
      {
        enabled: !!session,
        initialData: [],
      },
    ),
  );
  const getAuthedCollectionsKey =
    trpc.collection.getAuthedUserCollections.queryKey({ getGames: true });
  const showTrackerButton =
    !!session &&
    trackersStatus === "success" &&
    !trackersData?.find((tracker) => tracker.gameId === game.id);

  const showCollectionButton = !!session && collectionsStatus === "success";

  const showReviewButton = !!session;

    const showCollectionButton =
      status === "authenticated" && collectionsStatus === "success";

    const showReviewButton = status === "authenticated";
    // reviewsStatus === "success" &&
    // !reviewsData?.find((review) => review.gameId === game.id);

    const [trackerFormState, trackerFormAction] = useActionState(
      addTrackerFormAction,
      {
        gameId: game.id,
        status: "initial",
      },
    );

    const collectionActionGameId = editGameCollections.bind(null, game.id);
    const [collectionFormState, collectionFormAction, isCollectionsPending] =
      useActionState(collectionActionGameId, { status: "initial" });

    useEffect(() => {
      if (addTrackerDialogRef.current) {
        if (trackerFormState.status === "success") {
          addTrackerDialogRef.current.requestClose();
          queryClient.invalidateQueries({
            queryKey: getTrackersKey,
          });
        }
      }
    }, [trackerFormState.status]);

    useEffect(() => {
      if (addToCollectionDialogRef.current) {
        if (collectionFormState.status === "success" && !isCollectionsPending) {
          addToCollectionDialogRef.current.requestClose();
          queryClient.invalidateQueries({
            queryKey: getAuthedCollectionsKey,
          });
        }
      }
    }, [collectionFormState.status, isCollectionsPending]);

    const addTrackerDialog = (
      <Dialog ref={addTrackerDialogRef}>
        <form className={styles.add_tracker_form} action={trackerFormAction}>
          <legend>
            Start tracking <b>{game.name}</b>
          </legend>
          <label>
            Tracking status:
            <select defaultValue="BACKLOG" name="tracker-status" required>
              <option value="BACKLOG">Backlog</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETE">Complete</option>
            </select>
          </label>
          <Button>Submit</Button>
        </form>
      </Dialog>
    );

    const addReviewDialog = (
      <Dialog ref={addReviewDialogRef}>
        <form className={styles.add_tracker_form} action={addReviewFormAction}>
          <legend>
            Your review for <b>{game.name}</b>
          </legend>
          <label htmlFor="review-title">Title</label>
          <input id="review-title" type="text" maxLength={32} name="title" />
          <label htmlFor="review-desc">Description</label>
          <textarea id="review-desc" maxLength={512} name="description" />
          <label htmlFor="review-rating">Overall rating</label>
          <input
            id="review-rating"
            type="number"
            min="0"
            max="100"
            step="1"
            name="rating"
          />
          <Button>Submit</Button>
        </form>
      </Dialog>
    );

    const collectionsOptions = authedCollections.map((c) => ({
      value: c.id,
      text: c.title,
      checked: c.gameIds.includes(game.id),
    }));
    const msDefaultValue = collectionsOptions
      .filter((o) => o.checked)
      .map((o) => o.value);

    console.log({ msDefaultValue });
    const addToCollectionDialog = (
      <Dialog ref={addToCollectionDialogRef}>
        <form action={collectionFormAction}>
          <label htmlFor="collections-select">Add to collections</label>
          <MultiSelect
            name="collectionIds"
            id="collections-select"
            defaultValue={msDefaultValue}
          >
            {collectionsOptions
              .sort((a, b) => a.text.localeCompare(b.text))
              .map((o) => {
                return (
                  <option key={o.value} value={o.value}>
                    {o.text}
                  </option>
                );
              })}
          </MultiSelect>
          <Button type="submit">Submit</Button>
        </form>
      </Dialog>
    );

    const addTrackerButton = (
      <Button
        className={styles.tracker}
        disabled={!showTrackerButton}
        onClick={() => {
          if (addTrackerDialogRef.current) {
            addTrackerDialogRef.current.showModal();
          }
        }}
      >
        {trackerIcon}
      </Button>
    );
    const addCollectionButton = (
      <Button
        onClick={() => {
          addToCollectionDialogRef.current?.showModal();
        }}
        className={styles.bookmark}
        disabled={!showCollectionButton}
      >
        {collectionIcon}
      </Button>
    );

    const addReviewButton = (
      <Button
        className={styles.review}
        disabled={!showReviewButton}
        onClick={() => {
          if (addReviewDialogRef.current) {
            addReviewDialogRef.current.showModal();
          }
        }}
      >
        {reviewIcon}
      </Button>
    );

    return (
      <div className={styles.game_buttons_area}>
        {addTrackerButton}
        {addTrackerDialog}
        {addCollectionButton}
        {addReviewButton}
        {addReviewDialog}
        {addToCollectionDialog}
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

  const { data: similarGamesData, status: similarGamesStatus } =
    useSuspenseQuery(
      trpc.igdb.getGamesById.queryOptions(
        {
          gameIds: game.similar_games ?? [],
          limit: 8,
        },
        {
          enabled: !!game.similar_games?.length,
        },
      ),
    );

  const similarGames = () => {
    if (similarGamesStatus === "error") {
      return <>error loading similar games</>;
    }
    // if (similarGamesStatus === "pending") {
    //   return <>loading similar games...</>;
    // }
    if (similarGamesData.length === 0) {
      return <>no similar games!!</>;
    }
    return (
      <section className={styles.similar_games_area}>
        <h4>Similar games</h4>
        <Carousel anchor="similar_games">
          {similarGamesData.map((s) => (
            <Suspense
              key={s.id}
              fallback={<GameCardLoading direction="vertical" />}
            >
              <GameCard direction="vertical" gameId={s.id} game={s} />
            </Suspense>
          ))}
        </Carousel>
      </section>
    );
  };

  return (
    <section className={styles.game_section}>
      <header data-main-artwork-url={mainArtwork?.url}>
        {mainArtwork ? (
          <Image
            loader={igdbImageLoader}
            src={mainArtwork.image_id}
            width={mainArtwork.width}
            height={mainArtwork.height}
            placeholder={createPlaceholderShimmer(210, 280)}
            alt={mainArtwork.image_id}
            className={styles.game_main_artwork}
            preload={true}
            quality={75}
          />
        ) : null}
        <div className={styles.image_area}>
          <Image
            loader={igdbImageLoader}
            src={game.cover.image_id}
            alt={game.name}
            preload={true}
            placeholder={createPlaceholderShimmer(210, 280)}
            width={210}
            height={280}
            quality={75}
          />
          {gameButtons()}
        </div>
        <div>
          <h1>{game.name}</h1>
          <div>{gameSummary()}</div>
        </div>
      </header>
      <main className={styles.game_main_area}>
        <div className={styles.info_area}>
          {gameRatings()}
          <ReviewsArea game={game} />
          {similarGames()}
        </div>
      </main>
    </section>
  );
};

export const GameHeaderLoading = () => {
  return (
    <section className={styles.game_section}>
      <header>
        <div className={styles.image_area}>
          <div className={styles.game_cover_loading} />
        </div>
        <div>
          <div className={styles.game_text_loading} />
          <div className={styles.game_text_loading} />
          <div className={styles.game_text_loading} />
          <div className={styles.game_text_loading} />
        </div>
      </header>
    </section>
  );
};

export default GameArea;
