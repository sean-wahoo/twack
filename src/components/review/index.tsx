"use client";

import styles from "./review.module.scss";
import Image from "next/image";
import Button from "@/components/button";
import { likeIcon, solidLikeIcon } from "@/lib/svgIcons";
import { SafeReview } from "@/lib/types";
import { useTRPC } from "@/trpc/client";
import { useSession } from "next-auth/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Review } from "@/prisma/generated/prisma";

const Review: React.FC<{ review: SafeReview }> = ({ review }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const likeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: session, status } = useSession();

  const likesQueryKey = trpc.like.getLikesByObject.queryKey();
  const { data: likesData, status: likesStatus } = useSuspenseQuery(
    trpc.like.getLikesByObject.queryOptions({
      objectId: review.id,
      objectType: "review",
    }),
  );

  useEffect(() => {
    if (status === "authenticated" && likesStatus === "success") {
      setIsLiked(!!likesData.find((like) => like.userId === session.user.id));
    }
  }, [status]);
  const mutationOptions = trpc.like.toggleLike.mutationOptions({
    keyPrefix: undefined,
    onSettled: () => queryClient.invalidateQueries({ queryKey: likesQueryKey }),
  });
  const setLikeMutation = useMutation(mutationOptions);

  const onLikeButtonClick: React.MouseEventHandler<HTMLButtonElement> = async (
    e,
  ) => {
    e.preventDefault();
    likeButtonRef.current!.disabled = true;

    setIsLiked(!isLiked);
    await setLikeMutation.mutateAsync({
      isLiked: !isLiked,
      objectType: "review",
      objectId: review.id,
    });
    likeButtonRef.current!.disabled = false;
  };
  return (
    <div key={review.id} className={styles.game_review}>
      <header>
        <Image
          src={review.user.image as string}
          alt={review.user.name}
          width={24}
          height={24}
        />
        <p>{review.user.name}</p>
      </header>
      <div>
        <h4>{review.title} </h4>
        <p> at {review.createdAt.toLocaleDateString()}</p>
      </div>
      <p>{review.description}</p>
      <footer>
        <span>
          <Button
            ref={likeButtonRef}
            onClick={onLikeButtonClick}
            className={[styles.like_button, isLiked ? styles.liked : null].join(
              " ",
            )}
          >
            {isLiked ? solidLikeIcon : likeIcon}
          </Button>
          <p>{likesData.length}</p>
        </span>
      </footer>
    </div>
  );
};

export const ReviewLoading = () => {
  return (
    <div className={[styles.game_review, styles.loading].join(" ")}>
      <header>
        <span className={styles.review_author_image_sk} />
        <span className={styles.review_author_sk} />
      </header>
      <div>
        <span className={styles.review_title_sk} />
        <span className={styles.review_text_sk} />
        <span className={styles.review_text_sk} />
      </div>
      <footer>
        <span className={styles.likes_sk} />
      </footer>
    </div>
  );
};

export default Review;
