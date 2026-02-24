"use client";
import { DragEventHandler, Suspense } from "react";
import styles from "./kanban.module.scss";
import { trpc as _trpc, useTRPC } from "@/trpc/client";
import { TrackerStatus } from "@/prisma/generated/prisma/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/client";
import { Game } from "@/lib/types";
import GameCard from "../gameCard";
import { c } from "@/lib/utils";
import { Tracker } from "@/prisma/generated/prisma/client";

const Kanban = () => {
  const cols = [
    {
      name: TrackerStatus.BACKLOG,
      key: TrackerStatus.BACKLOG,
    },
    {
      name: TrackerStatus.IN_PROGRESS,
      key: TrackerStatus.IN_PROGRESS,
    },
    {
      name: TrackerStatus.COMPLETE,
      key: TrackerStatus.COMPLETE,
    },
  ];

  const trpc = useTRPC();

  const { data: session } = useSession();

  const authedTrackersKey = trpc.tracker.getAuthedUserTrackers.queryKey();
  const { data: authedTrackersData, status: authedTrackersStatus } = useQuery(
    trpc.tracker.getAuthedUserTrackers.queryOptions(
      { withGames: true },
      {
        enabled: !!session,
      },
    ),
  );

  let lastDropTarget: EventTarget | null = null;
  const handleDragover: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (lastDropTarget === e.target) {
      return;
    }
    lastDropTarget = e.target;

    if ((e.target as HTMLDivElement).classList.contains(styles.col)) {
      const { pageX, pageY } = e;
      console.log({ pageX, pageY });
    }
  };

  const handleCardDragStart: DragEventHandler<HTMLDivElement> = (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        trackerId: e.currentTarget.dataset.trackerId,
        cardKey: e.currentTarget.dataset.cardKey,
        prevColKey: e.currentTarget.parentElement?.dataset.colKey,
      }),
    );
  };

  const dragDropMutation = useMutation(
    trpc.tracker.dragDropKanban.mutationOptions({
      onMutate: async (result, context) => {
        await context.client.cancelQueries({
          queryKey: authedTrackersKey,
        });

        const previousQueryResults = authedTrackersData;
        console.log({ previousQueryResults, result, context });
        const updatedTrackers = previousQueryResults?.trackers.map(
          (tracker) => {
            if (tracker.id === result.trackerId) {
              tracker.status = result.status;
            }
            return tracker;
          },
        );

        const optimisticQueryResults = {
          trackers: updatedTrackers,
          games: previousQueryResults?.games,
        };
        console.log("be optimistic", optimisticQueryResults);
        return optimisticQueryResults;
      },
      onError: (error, modifier, onMutateResult, context) => {
        context.client.setQueryData(
          authedTrackersKey,
          onMutateResult as { trackers: Tracker[]; games: Game[] },
        );
      },
      onSettled: (modifier, error, variables, onMutateResult, context) => {
        context.client.invalidateQueries({ queryKey: authedTrackersKey });
      },
    }),
  );

  const handleCardDrop: DragEventHandler<HTMLDivElement> = async (e) => {
    const {
      trackerId,
      cardKey,
      prevColKey,
    }: {
      trackerId: string;
      cardKey: string;
      prevColKey: keyof typeof TrackerStatus;
    } = JSON.parse(e.dataTransfer.getData("text/plain"));

    const newStatus = e.currentTarget.dataset
      .colKey as keyof typeof TrackerStatus;

    if (prevColKey === newStatus) {
      return;
    }
    await dragDropMutation.mutateAsync({
      prevStatus: prevColKey,
      status: newStatus,
      trackerId: trackerId,
    });
  };

  const cards =
    authedTrackersData?.trackers.map((tracker) => {
      return {
        name: tracker.id,
        id: tracker.id,
        col: tracker.status,
        key: tracker.gameId,
        game: authedTrackersData.games.find(
          (game) => game.id === tracker.gameId,
        ) as Game,
      };
    }) ?? [];

  const colsContent = (
    <Suspense fallback={<p>loading ahahah...</p>}>
      {cols.map((col) => {
        const cardsInCol = cards.filter((c) => c.col === col.key);
        return (
          <div
            key={col.name}
            id={`kanban-col-${col.key}`}
            data-col-key={col.key}
            className={styles.col}
            onDragOverCapture={handleDragover}
            onDropCapture={handleCardDrop}
          >
            <h4>{col.name}</h4>
            {cardsInCol.map((card, index) => {
              return (
                <GameCard
                  key={card.key}
                  draggable="true"
                  game={card.game}
                  data-card-key={card.key}
                  data-tracker-id={card.id}
                  className={c(styles.card, styles.draggable)}
                  isLink={false}
                  direction="horizontal"
                  onDragStartCapture={handleCardDragStart}
                />
              );
            })}
          </div>
        );
      })}
    </Suspense>
  );

  return <main className={styles.kanban}>{colsContent}</main>;
};

export default Kanban;
