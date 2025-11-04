import styles from "./collection.module.scss";
import { editCollectionFormAction } from "@/lib/actions";
import { editIcon } from "@/lib/svgIcons";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useActionState, useEffect } from "react";
import Button from "../button";
import Dialog from "../dialog";
import type { Collection } from "@/prisma/generated/prisma";

const Collection: React.FC<{ collection: Collection }> = ({ collection }) => {
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const editCollectionWithId = editCollectionFormAction.bind(
    null,
    collection.id,
  );
  const [editCollectionStatus, editCollectionAction, isPending] =
    useActionState(editCollectionWithId, { status: "initial" });
  const editCollectionDialog = (
    <Dialog id={`${collection.id}-edit-dialog`} ref={editDialogRef}>
      <form action={editCollectionAction}>
        <label htmlFor="collection-title">Title: </label>
        <input
          id="collection-title"
          type="text"
          name="title"
          defaultValue={collection.title}
        />
        <label htmlFor="collection-desc">Description: </label>
        <textarea
          id="collection-desc"
          name="description"
          defaultValue={collection.description}
        />
        <Button type="submit">Save</Button>
      </form>
    </Dialog>
  );
  const editButtonOnClick = () => {
    editDialogRef.current?.showModal();
  };

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const collectionsQueryKey =
    trpc.collection.getAuthedUserCollections.queryKey();

  useEffect(() => {
    if (!isPending && editCollectionStatus.status === "success") {
      queryClient.invalidateQueries({
        queryKey: collectionsQueryKey,
      });
      editDialogRef.current?.requestClose();
    }
  }, [isPending, editCollectionStatus.status]);

  return (
    <div key={collection.id} className={styles.collection}>
      <header>
        <h3>{collection.title}</h3>
        <Button onClick={editButtonOnClick} className={styles.edit_collection}>
          {editIcon}
        </Button>
      </header>
      <p>{collection.description}</p>
      <p>
        {collection.gameIds.length}{" "}
        {collection.gameIds.length === 1 ? "game" : "games"}
      </p>
      {editCollectionDialog}
    </div>
  );
};

export default Collection;
