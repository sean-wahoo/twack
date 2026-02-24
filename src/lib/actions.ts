"use server";

import { TrackerStatus } from "@/prisma/generated/prisma/enums";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/prisma/prisma";

export type FormReturnState = {
  status?: "initial" | "error" | "success";
  gameId?: string;
};

export async function addTrackerFormAction(
  initialState: FormReturnState,
  formData: FormData,
): Promise<FormReturnState> {
  try {
    const status = formData.get("tracker-status") as TrackerStatus;
    const gameId = initialState.gameId ?? (formData.get("gameId") as string);
    const complete = status === "COMPLETE";

    const session = await getSession();
    if (!session) {
      throw new Error("not authed");
    }
    const userId = session.userId;

    await prisma.tracker.create({
      data: {
        userId: userId,
        status: status,
        gameId: gameId,
        complete: complete,
      },
    });
    return { status: "success" };
  } catch (e) {
    console.log({ e });
    return {
      status: "error",
    };
  }
}

export type CollectionFormState = {
  title: string;
  description: string;
};
export async function addCollectionFormAction(
  _initialState: FormReturnState,
  formData: FormData,
): Promise<FormReturnState> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const session = await getSession();

    if (!session) {
      throw new Error("not authed");
    }
    const userId = session.userId;

    await prisma.collection.create({
      data: {
        title: title,
        description: description,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return { status: "success" };
  } catch (e) {
    console.log({ e });
    return {
      status: "error",
    };
  }
}
export async function editCollectionFormAction(
  collectionId: string,
  _prevState: any,
  formData: FormData,
): Promise<FormReturnState> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: {
        title: title,
        description: description,
      },
    });
    return { status: "success" };
  } catch (e) {
    console.log({ e });
    return {
      status: "error",
    };
  }
}

export async function editGameCollections(
  gameId: string,
  _prevState: any,
  formData: FormData,
): Promise<FormReturnState> {
  try {
    const collectionIds = formData.getAll("collectionIds") as string[];
    const session = await getSession();
    if (!session) {
      throw new Error("not authed");
    }

    const collectionsToSet = await prisma.collection.findMany({
      where: {
        userId: session.userId,
        id: {
          in: collectionIds,
        },
        OR: [
          {
            gameIds: {
              isEmpty: true,
            },
          },
          {
            NOT: {
              gameIds: {
                has: gameId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });
    const collectionsToUnset = await prisma.collection.findMany({
      where: {
        userId: session.userId,
        id: {
          notIn: collectionIds,
        },
        gameIds: {
          has: gameId,
        },
      },
      select: {
        id: true,
        gameIds: true,
      },
    });
    await prisma.collection.updateMany({
      where: {
        id: {
          in: collectionsToSet.map((c: { id: string }) => c.id),
        },
        userId: session.userId,
        NOT: {
          gameIds: {
            has: gameId,
          },
        },
      },
      data: {
        gameIds: {
          push: gameId,
        },
      },
    });
    for (const collection of collectionsToUnset) {
      const { gameIds, id } = collection;
      if (!gameIds.includes(gameId)) {
        continue;
      }
      const newGameIds = gameIds.filter((g) => g !== gameId);
      await prisma.collection.update({
        where: {
          id: id,
        },
        data: {
          gameIds: newGameIds,
        },
      });
    }
    return { status: "success" };
  } catch (e) {
    console.log({ e });
    return { status: "error" };
  }
}

export async function addReviewFormAction(formData: FormData): Promise<void> {
  try {
    const gameId = formData.get("gameId") as string;
    const rating = formData.get("rating") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const session = await getSession();
    if (!session) {
      throw new Error("no auth");
    }
    await prisma.review.create({
      data: {
        userId: session.userId,
        rating: Number(rating),
        gameId: gameId,
        title: title,
        description: description,
      },
    });
  } catch (e) {
    console.log({ e });
  }
}
