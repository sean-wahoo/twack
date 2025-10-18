"use client";

import { useTRPC } from "@/trpc/client";
import { clickInRect, debounce } from "@/lib/utils";
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
import { useEffect, useRef, useState } from "react";
import type { Game } from "@/lib/types";
import GameCard from "@/components/gameCard";
import Dialog from "@/components/dialog";
import { TrackerStatus } from "@/prisma/generated/prisma";
import Button from "@/components/button";

const Profile: React.FC<{
  username: string;
}> = ({ username }) => {
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
  const { data: user } = useSuspenseQuery(
    trpc.user.getUserByName.queryOptions({ name: username }),
  );

  const createTrackerMutation = useMutation(
    trpc.tracker.createTracker.mutationOptions(),
  );

  if (!user) {
    notFound();
  }

  const addTrackerButtonClick: React.MouseEventHandler = (e) => {
    if (addTrackerDialogRef.current) {
      addTrackerDialogRef.current.showModal();
    }
  };

  const gameSearchQuery = useQuery(
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
    if (gameSearchQuery.isPending) {
      return <>pending...</>;
    }
    if (!gameSearchQuery.isSuccess) {
      return <>um uh oh!</>;
    }
    const elements = [];
    for (const game of gameSearchQuery.data.games ?? []) {
      const onGameClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
        const { gameId } = e.currentTarget.dataset;
        createTrackerMutation
          .mutateAsync({
            gameId: gameId ?? "",
            status: "IN_PROGRESS",
          })
          .then(() => {
            addTrackerDialogRef.current?.close();
            queryClient.invalidateQueries({
              queryKey: userQueryKey,
            });
          });
      };
      const gameElement = (
        <GameCard key={game.id} game={game} onClick={onGameClick} />
      );
      elements.push(gameElement);
    }
    return elements;
  };

  const gameIds = user.trackers.map((t) => t.gameId.toString());
  const { data: trackerGames, status: trackerGamesQueryStatus } = useQuery(
    trpc.igdb.getGamesById.queryOptions(
      {
        gameIds: gameIds,
      },
      {
        enabled: gameIds.length > 0 && user?.trackers?.length > 0,
      },
    ),
  );

  const trackers = () => {
    return (
      <ul className={styles.profile_tracker_list}>
        {trackerGamesQueryStatus === "success" &&
        trackerGames.games.length > 0 ? (
          trackerGames.games.map((game) => {
            const relatedTracker = user.trackers.find(
              (tracker) => game.id.toString() === tracker.gameId,
            );
            if (!relatedTracker) {
              return;
            }

            const onEditClick: React.MouseEventHandler<HTMLSpanElement> = (
              e,
            ) => {
              const { trackerId } = e.currentTarget.dataset;
              setCurrentEditTracker(trackerId as string);

              editTrackerDialogRef.current?.showModal();
            };

            return (
              <li key={game.id}>
                <Image
                  src={game.cover.url}
                  decoding="async"
                  alt={game.name}
                  width={90}
                  height={120}
                />
                <div>
                  <h2>{game.name}</h2>
                  <h4>{relatedTracker.status}</h4>
                  <Button
                    data-tracker-id={relatedTracker.id}
                    onClick={onEditClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </Button>
                  <p>
                    tracking since{" "}
                    {relatedTracker.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <h2>no trackers!</h2>
        )}
      </ul>
    );
  };

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
    const relatedTracker = user.trackers.find(
      (tracker) => currentEditTracker === tracker.id,
    );
    const editingTrackerGame = trackerGames?.games.find(
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
    <section className={styles.profile_section}>
      <header>
        <Image
          src={user.image ?? ""}
          alt={user.name + " profile image hehe"}
          width={120}
          height={120}
        />
        <div>
          <h2>{user.name}</h2>
          <h5>playing - {user.trackers.length}</h5>
          <h5>
            finished -{" "}
            {user.trackers.filter((tracker) => tracker.complete).length}
          </h5>
          <h5>reviews - {user.reviews.length}</h5>
          <p>member since {user.createdAt.toLocaleDateString()}</p>
        </div>
      </header>
      <main>
        <header>
          <Button
            onClick={addTrackerButtonClick}
            className={styles.add_tracker_button}
          >
            add tracker
          </Button>
        </header>
        {trackers()}
      </main>
      {addTrackerDialog()}
      {editTrackerDialog()}
    </section>
  );
};

export default Profile;
