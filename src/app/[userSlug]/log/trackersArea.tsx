"use client";

import GameCard from "@/components/gameCard";
import { TrackerStatus } from "@/prisma/generated/prisma";
import { useTRPC } from "@/trpc/client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import styles from "./log.module.scss";
import { Suspense, useState } from "react";
import { notFound } from "next/navigation";

enum DISPLAY_TYPES {
  board = "board",
  grid = "grid",
}
const trackersArea: React.FC<{ userSlug: string; isOwnProfile: boolean }> = ({
  userSlug,
  isOwnProfile,
}) => {
  const [displayType, setDisplayType] = useState<"grid" | "board">("board");
  const trpc = useTRPC();
  const { data: userData, status: userStatus } = useQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  if (userStatus === "error") {
    return <p>loading...</p>;
  }

  if (!userData) {
    notFound();
  }

  const trackerGameIds = userData.trackers.map((tracker) => tracker.gameId);
  const { data: trackerGamesData, status: trackerGamesStatus } = useQuery(
    trpc.igdb.getGamesById.queryOptions(
      { gameIds: trackerGameIds },
      {
        enabled: trackerGameIds.length > 0,
        initialData: [],
        initialDataUpdatedAt: 0,
      },
    ),
  );

  if (trackerGamesStatus === "error") {
    return <p>error trackers...</p>;
  }

  if (!trackerGamesData) {
    console.log("hrm");
    return;
  }

  const trackerHeaders = () => {
    let headerCounter = 0;
    return Object.keys(TrackerStatus).map((key) => (
      <h3
        className={styles[key.toLowerCase()]}
        key={key}
        data-order={++headerCounter}
      >
        {key}
      </h3>
    ));
  };
  const trackerBody = () => {
    const content: React.ReactNode[] = [];
    console.log({ content });
    for (const tracker of userData.trackers) {
      const relatedGame = trackerGamesData.find(
        (game) => game.id === tracker.gameId,
      );
      if (!relatedGame) {
        continue;
      }
      let gameColumn = 0;

      switch (tracker.status) {
        case "BACKLOG": {
          gameColumn = 0;
          break;
        }
        case "IN_PROGRESS": {
          gameColumn = 1;
          break;
        }
        case "COMPLETE": {
          gameColumn = 2;
          break;
        }
      }
      const styleObj = {
        gridColumn: gameColumn,
      };
      content.push(
        <GameCard
          order={gameColumn}
          key={tracker.gameId}
          game={relatedGame}
          forceHideStatus={displayType === "board"}
          tracker={tracker}
          style={displayType === "board" ? styleObj : {}}
        />,
      );
    }

    if (content.length === 0) {
      return <p>damn no trackers???</p>;
    }
    return content;
  };

  const displayTypeDropdown = () => {
    return (
      <>
        <label htmlFor="display-type-select">display type</label>
        <select
          id="display-type-select"
          onChange={(e) =>
            setDisplayType(e.currentTarget?.value as DISPLAY_TYPES)
          }
          defaultValue={displayType}
        >
          <option>board</option>
          <option>grid</option>
        </select>
      </>
    );
  };

  const hasTrackers = userData.trackers.length > 0;
  return (
    <section>
      <header>{hasTrackers ? displayTypeDropdown() : null}</header>
      <div>
        {hasTrackers && displayType === "board" ? trackerHeaders() : null}
        {trackerBody()}
      </div>
    </section>
  );
};

export default trackersArea;
