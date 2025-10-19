"use client";

import GameCard from "@/components/gameCard";
import { TrackerStatus } from "@/prisma/generated/prisma";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import styles from "./log.module.scss";
import { useState } from "react";

enum DISPLAY_TYPES {
  board = "board",
  grid = "grid",
}
const trackersArea: React.FC<{ userSlug: string }> = ({ userSlug }) => {
  const [displayType, setDisplayType] = useState<"grid" | "board">("board");
  const trpc = useTRPC();
  const { data: trackersData, status: trackersStatus } = useQuery(
    trpc.tracker.getTrackersByUserSlug.queryOptions(
      { slug: userSlug },
      { initialData: [], initialDataUpdatedAt: 0 },
    ),
  );

  console.log({ trackersStatus, trackersData });

  const trackerGameIds = trackersData.map((tracker) => tracker.gameId);

  const { data: trackerGamesData, status: trackerGamesStatus } = useQuery(
    trpc.igdb.getGamesById.queryOptions(
      { gameIds: trackerGameIds },
      {
        enabled: trackersStatus === "success" && trackersData.length > 0,
        initialData: { games: [] },
        initialDataUpdatedAt: 0,
      },
    ),
  );

  // const mappedTrackers: { [key in TrackerStatus]: React.ReactNode[] } =
  //   Object.fromEntries(
  //     Object.values(TrackerStatus).map((key) => {
  //       console.log({ key, trackersData });
  //       const matchingTrackers = trackersData
  //         .filter((tracker) => tracker.status.toString() === key)
  //         .map((tracker) => {
  //           console.log({ tracker });
  //           const trackerGame = trackerGamesData?.games.find(
  //             (game) => game.id === tracker.gameId,
  //           );
  //           if (trackerGame) {
  //             return <GameCard key={trackerGame.id} game={trackerGame} />;
  //           }
  //         });
  //       return [key as TrackerStatus, matchingTrackers as React.ReactNode];
  //     }),
  //   );

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
    for (const key of Object.values(TrackerStatus)) {
      const relatedTrackers = trackersData.filter(
        (tracker) => tracker.status.toString() === key,
      );
      let bodyCounter = 0;
      for (const tracker of relatedTrackers) {
        const relatedGame = trackerGamesData.games.find(
          (game) => game.id === tracker.gameId,
        );
        if (!relatedGame) {
          console.log("wtf");
          continue;
        }

        const gameColumn =
          Object.values(TrackerStatus).findIndex(
            (key) => key === tracker.status.toString(),
          ) + 1;
        const styleObj = {};
        Object.defineProperty(styleObj, "gridColumn", { value: gameColumn });
        content.push(
          <GameCard
            order={gameColumn}
            key={tracker.gameId}
            game={relatedGame}
            forceHideStatus={displayType === "board"}
            tracker={tracker}
            style={
              displayType === "board"
                ? {
                    gridColumn: gameColumn,
                  }
                : {}
            }
          />,
        );
      }
    }
    return content;
  };
  return (
    <>
      <section>
        <header>
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
        </header>
        <div>
          {displayType === "board" ? trackerHeaders() : null}
          {trackerBody()}
          {/* {Object.entries(mappedTrackers).map(([trackerStatus, trackers]) => { */}
          {/*   console.log({ trackers }); */}
          {/*   return ( */}
          {/*     <div key={trackerStatus}> */}
          {/*       <h3>{trackerStatus}</h3> */}
          {/*       {trackers} */}
          {/*     </div> */}
          {/*   ); */}
          {/* })} */}
        </div>
      </section>
    </>
  );
};

export default trackersArea;
