"use client";

import { useTRPC } from "@/trpc/client";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import styles from "./log.module.scss";
import {
  MouseEventHandler,
  Suspense,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { notFound } from "next/navigation";
// import { type User as PrismaUser } from "@/prisma/generated/prisma/client";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { shelfSidebarAtom, shelfViewAtom } from "@/state/shelf";
import Button from "@/components/button";
import {
  barsIcon,
  collectionIcon,
  editIcon,
  sparklesIcon,
  trackerIcon,
  viewColumnsIcon,
} from "@/lib/svgIcons";
import Dialog from "@/components/dialog";
import {
  addCollectionFormAction,
  addTrackerFormAction,
  editCollectionFormAction,
} from "@/lib/actions";
import Collection from "@/components/collection";
import Kanban from "@/components/kanban";
import { c } from "@/lib/utils";
import { useSession, type $Infer } from "@/lib/auth/client";

const ShelfContent: React.FC<{ view: string }> = ({ view }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const collectionDialogRef = useRef<HTMLDialogElement>(null);
  const [collectionFormState, collectionFormAction] = useActionState(
    addCollectionFormAction,
    {},
  );

  const { data: session } = useSession();

  const { data: userCollections, status: userCollectionsStatus } =
    useSuspenseQuery(
      trpc.collection.getAuthedUserCollections.queryOptions(
        { getGames: true },
        {
          enabled: view === "collections" && !!session,
        },
      ),
    );

  const collectionQueryKey =
    trpc.collection.getAuthedUserCollections.queryKey();

  useEffect(() => {
    if (collectionDialogRef.current) {
      collectionDialogRef.current.requestClose();
      queryClient.invalidateQueries({
        queryKey: collectionQueryKey,
      });
    }
  }, [collectionFormState.status]);
  switch (view) {
    default:
    case "showcase": {
      return <></>;
    }
    case "trackers": {
      return (
        <>
          <Kanban />
        </>
      );
    }
    case "collections": {
      console.log({ userCollections });
      const addCollectionFormDialog = (
        <Dialog ref={collectionDialogRef}>
          <form
            className={styles.add_collection_form}
            action={collectionFormAction}
          >
            <h4>Add new collection</h4>
            <label htmlFor="new-collection-name">Name: </label>
            <input
              id="new-collection-name"
              name="title"
              type="text"
              minLength={3}
              maxLength={48}
            />
            <label htmlFor="new-collection-desc">Description: </label>
            <textarea
              name="description"
              id="new-collection-desc"
              minLength={3}
              maxLength={48}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Dialog>
      );

      const addCollectionButton = (
        <Button
          className={styles.add_collection_button}
          onClick={() => collectionDialogRef?.current?.showModal()}
        >
          +
        </Button>
      );

      const collectionsArea = (
        <section className={styles.collections_area}>
          {userCollections.map((collection) => (
            <Collection key={collection.id} collection={collection} />
          ))}
        </section>
      );
      return (
        <>
          {addCollectionFormDialog}
          <Suspense fallback={<p>loading collections...</p>}>
            {collectionsArea}
          </Suspense>
          {addCollectionButton}
        </>
      );
    }
  }
};

const shelfArea: React.FC<{ userSlug: string; isOwnProfile: boolean }> = ({
  userSlug,
  isOwnProfile,
}) => {
  const trpc = useTRPC();
  const { data: userData, status: userStatus } = useSuspenseQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );

  if (userStatus === "error") {
    return <p>loading...</p>;
  }

  const trackerGameIds = userData.trackers.map((tracker) =>
    Number(tracker.gameId),
  );
  const { data: trackerGamesData, status: trackerGamesStatus } =
    useSuspenseQuery(
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
  const shelfView = useAtomValue(shelfViewAtom);

  return (
    <section className={styles.shelf_area}>
      <ShelfContent view={shelfView} />
    </section>
  );
};

export const ShelfSidebar = ({
  user,
}: {
  user: typeof $Infer.Session.user;
}) => {
  const [open, toggleSidebar] = useAtom(shelfSidebarAtom);
  const [shelfView, setShelfView] = useAtom(shelfViewAtom);

  const buttonOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const { view } = e.currentTarget.dataset;
    setShelfView(view as typeof shelfView);
  };

  const showcaseButton = (
    <Button
      onClick={buttonOnClick}
      data-view="showcase"
      className={c(
        styles.showcase,
        shelfView === "showcase" ? styles.active : null,
      )}
    >
      {sparklesIcon}
    </Button>
  );
  const trackersButton = (
    <Button
      onClick={buttonOnClick}
      data-view="trackers"
      className={c(
        styles.trackers,
        shelfView === "trackers" ? styles.active : null,
      )}
    >
      {viewColumnsIcon}
    </Button>
  );
  const collectionsButton = (
    <Button
      onClick={buttonOnClick}
      data-view="collections"
      className={c(
        styles.collections,
        shelfView === "collections" ? styles.active : null,
      )}
    >
      {collectionIcon}
    </Button>
  );
  return (
    <article className={c(styles.shelf_sidebar, open ? styles.open : null)}>
      {showcaseButton}
      {trackersButton}
      {collectionsButton}
    </article>
  );
};

export default shelfArea;
