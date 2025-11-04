"use client";

import { useTRPC } from "@/trpc/client";
import { debounce } from "@/lib/utils";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { notFound } from "next/navigation";
import styles from "./page.module.scss";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Suspense, useRef, useState } from "react";
import GameCard, { Loading as GameCardLoading } from "@/components/gameCard";
import Dialog from "@/components/dialog";
import { TrackerStatus } from "@/prisma/generated/prisma";
import Button from "@/components/button";
import { editIcon } from "@/lib/svgIcons";
import Carousel from "@/components/carousel";

const Profile: React.FC<{
  userSlug: string;
}> = ({ userSlug }) => {
  const trpc = useTRPC();
  const [gameSearchValue, setGameSearchValue] = useState<string>("");
  const [gameSearchResultContent, setGameSearchResultContent] =
    useState<React.ReactNode>([]);
  const [currentEditTracker, setCurrentEditTracker] = useState<string>("");

  const addTrackerDialogRef = useRef<HTMLDialogElement>(null);
  const addTrackerFormRef = useRef<HTMLFormElement>(null);
  const editTrackerDialogRef = useRef<HTMLDialogElement>(null);
  const editTrackerFormRef = useRef<HTMLFormElement>(null);

  const gameSearchQueryKey = trpc.igdb.getGamesSearch.queryKey();
  const userQueryKey = trpc.user.getUserByName.queryKey();

  const queryClient = useQueryClient();

  const { data, status } = useSession();
  const { data: userData } = useSuspenseQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  const createTrackerMutation = useMutation(
    trpc.tracker.createTracker.mutationOptions(),
  );

  if (!userData) {
    notFound();
  }

  const addTrackerButtonClick: React.MouseEventHandler = (e) => {
    if (addTrackerDialogRef.current) {
      addTrackerDialogRef.current.showModal();
    }
  };

  const { data: gamesData, status: gamesStatus } = useSuspenseQuery(
    trpc.igdb.getGamesSearch.queryOptions(
      { search: gameSearchValue },
      {
        enabled:
          gameSearchValue.length > 0 && addTrackerDialogRef.current!.open,
      },
    ),
  );

  const searchDebouncedCallback = debounce((value: string) => {
    setGameSearchValue(value);
    queryClient.invalidateQueries({ queryKey: gameSearchQueryKey });
  }, 500);

  const searchInputOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    searchDebouncedCallback(e.currentTarget.value);

  const gameSearchContent = () => {
    const elements = [];
    for (const game of gamesData ?? []) {
      const gameElement = (
        <GameCard key={game.id} gameId={game.id} game={game} />
      );
      elements.push(gameElement);
    }
    return elements;
  };

  const gameIds = userData.trackers.map((t) => Number(t.gameId));
  const { data: trackerGames, status: trackerGamesQueryStatus } = useQuery(
    trpc.igdb.getGamesById.queryOptions(
      {
        gameIds: gameIds,
      },
      {
        enabled: gameIds.length > 0 && userData?.trackers?.length > 0,
      },
    ),
  );

  const addTrackerDialog = () => {
    return (
      <Dialog ref={addTrackerDialogRef} className={styles.add_tracker_dialog}>
        <form ref={addTrackerFormRef}>
          <label>
            Select game
            <input
              onChange={searchInputOnChange}
              name="add-tracker-form"
              placeholder="..."
            />
          </label>
          <span className={styles.game_search_result_container}>
            {gameSearchContent()}
          </span>
        </form>
      </Dialog>
    );
  };

  const updateTrackerMutation = useMutation(
    trpc.tracker.updateTracker.mutationOptions(),
  );

  const deleteTrackerMutation = useMutation(
    trpc.tracker.deleteTracker.mutationOptions(),
  );
  const editTrackerDialog = () => {
    const relatedTracker = userData.trackers.find(
      (tracker) => currentEditTracker === tracker.id,
    );
    const editingTrackerGame = trackerGames?.find(
      (game) => relatedTracker?.gameId === game.id.toString(),
    );
    if (!relatedTracker || !editingTrackerGame) {
      return <Dialog ref={editTrackerDialogRef} />;
    }

    const formOnSubmit: React.FormEventHandler = (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const status = formData.get("status") as TrackerStatus;
      if (!status) {
        console.error("wtf?");
        return;
      }

      updateTrackerMutation
        .mutateAsync({
          trackerId: currentEditTracker,
          status,
        })
        .then(() => {
          editTrackerDialogRef.current?.close();
          queryClient.invalidateQueries({
            queryKey: userQueryKey,
          });
          console.log("updated!!");
        })
        .catch((e) => {
          console.log({ e });
        });
    };

    const deleteTrackerButtonClick: React.MouseEventHandler<
      HTMLButtonElement
    > = () => {
      deleteTrackerMutation
        .mutateAsync({
          trackerId: currentEditTracker,
        })
        .then(() => {
          editTrackerDialogRef.current?.close();
          queryClient.invalidateQueries({
            queryKey: userQueryKey,
          });
        })
        .catch((e) => console.log({ e }));
    };
    return (
      <Dialog
        ref={editTrackerDialogRef}
        className={styles.edit_tracker_dialog}
        id="dialog"
        onClose={() => {
          setCurrentEditTracker("");
        }}
      >
        <form onSubmit={formOnSubmit} ref={editTrackerFormRef}>
          <Image
            src={editingTrackerGame.cover.url as string}
            decoding="async"
            alt={editingTrackerGame.name as string}
            width={90}
            height={120}
          />
          <div>
            <h4>{editingTrackerGame.name}</h4>
            <label>
              status:
              <select name="status" defaultValue={relatedTracker.status}>
                {Object.keys(TrackerStatus).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div>
              <Button type="submit">save</Button>
              <Button
                onClick={deleteTrackerButtonClick}
                className={styles.delete_tracker_button}
                type="button"
              >
                delete
              </Button>
            </div>
          </div>
        </form>
      </Dialog>
    );
  };

  return (
    <main className={styles.profile_section}>
      <section>
        <header></header>
      </section>
    </main>
  );
};

export const ProfileImage = ({ userSlug }: { userSlug: string }) => {
  const trpc = useTRPC();
  const { data: userData } = useSuspenseQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  return (
    <Image
      src={userData.image as string}
      alt={userData.name + " profile image hehe"}
      width={120}
      height={120}
    />
  );
};

export const ProfileHeaderLoading = () => {
  return (
    <header>
      <span className={styles.profile_image_loading} />
      <div>
        <span className={styles.profile_name_loading} />
        <span className={styles.profile_text_loading} />
        <span className={styles.profile_text_loading} />
        <span className={styles.profile_text_loading} />
      </div>
    </header>
  );
};

export const ProfileHeader = ({ userSlug }: { userSlug: string }) => {
  const trpc = useTRPC();
  const { data: userData } = useSuspenseQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );
  return (
    <header className={styles.profile_header}>
      <ProfileImage userSlug={userSlug} />
      <div>
        <h2>{userData.name}</h2>
        {/* <h5> */}
        {/*   playing -{" "} */}
        {/*   {userData.trackers.filter((tracker) => !tracker.complete).length} */}
        {/* </h5> */}
        {/* <h5> */}
        {/*   finished -{" "} */}
        {/*   {userData.trackers.filter((tracker) => tracker.complete).length} */}
        {/* </h5> */}
        {/* <h5>reviews - {userData.reviews.length}</h5> */}
        <p>member since {userData.createdAt.toLocaleDateString()}</p>
      </div>
    </header>
  );
};

export const ProfileBody = ({ userSlug }: { userSlug: string }) => {
  const trpc = useTRPC();
  const { data: userData, status: userStatus } = useSuspenseQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );
  // const completedGameIds = userData.trackers.filter(t => t.status === TrackerStatus.COMPLETE)
  const userTrackerGameIds = userData.trackers.map((tracker) =>
    Number(tracker.gameId),
  );
  const { data: userTrackedGames, status: userTrackedGamesStatus } =
    useSuspenseQuery(
      trpc.igdb.getGamesById.queryOptions(
        {
          gameIds: userTrackerGameIds,
        },
        {
          enabled: userTrackerGameIds.length > 0 && userStatus === "success",
        },
      ),
    );

  const completedGames = userTrackedGames
    .filter((game) => {
      const relatedTracker = userData.trackers.find(
        (t) => t.gameId === game.id,
      );
      return relatedTracker?.status === TrackerStatus.COMPLETE;
    })
    .map((game, index) => (
      <GameCard
        key={"ip" + index}
        gameId={game.id}
        game={game}
        direction="vertical"
      />
    ));
  const inProgressGames = userTrackedGames
    .filter((game) => {
      const relatedTracker = userData.trackers.find(
        (t) => t.gameId === game.id,
      );
      return relatedTracker?.status === TrackerStatus.IN_PROGRESS;
    })
    .map((game, index) => (
      <GameCard
        key={"c" + index}
        gameId={game.id}
        game={game}
        direction="vertical"
      />
    ));

  return (
    <section className={styles.profile_body}>
      <h4>In Progress Games</h4>
      <Carousel anchor="in_progress">
        <Suspense
          fallback={Array.from({ length: 4 }, (_, i) => (
            <GameCardLoading key={"ip" + i} direction="vertical" />
          ))}
        >
          {inProgressGames}
        </Suspense>
      </Carousel>
      <h4>Completed Games</h4>
      <Carousel anchor="completed">
        <Suspense
          fallback={Array.from({ length: 4 }, (_, i) => (
            <GameCardLoading key={"c" + i} direction="vertical" />
          ))}
        >
          {completedGames}
        </Suspense>
      </Carousel>
    </section>
  );
};

export const ProfileBodyLoading = () => {
  return (
    <section className={styles.profile_body}>
      <h4>In Progress Games</h4>
      <Carousel anchor="in_progress">
        {Array.from({ length: 5 }, (_, i) => (
          <GameCardLoading key={"ip" + i} direction="vertical" />
        ))}
      </Carousel>
      <h4>Completed Games</h4>
      <Carousel anchor="completed">
        {Array.from({ length: 5 }, (_, i) => (
          <GameCardLoading key={"c" + i} direction="vertical" />
        ))}
      </Carousel>
      <GameCardLoading direction="vertical" />
    </section>
  );
};

export default Profile;
