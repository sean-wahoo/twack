"use client";
import Review, { ReviewLoading } from "@/components/review";
import styles from "./gamePage.module.scss";
import { useTRPC } from "@/trpc/client";
import { Game } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

const ReviewsArea = ({ game }: { game: Game }) => {
  const trpc = useTRPC();
  const { data: reviewsData, status: reviewsStatus } = useSuspenseQuery(
    trpc.review.getReviewsByIgdbGameId.queryOptions({ gameId: game.id }),
  );
  const getReviewsKey = trpc.review.getReviewsByUserId.queryKey();
  return (
    <section className={styles.game_reviews}>
      <h4>Popular reviews</h4>
      <div>
        <Suspense
          fallback={Array.from({ length: 5 }, (_, i) => (
            <ReviewLoading key={i} />
          ))}
        >
          {reviewsData.length ? (
            reviewsData.map((review) => {
              return <Review key={review.id} review={review} />;
            })
          ) : (
            <p>No reviews yet!</p>
          )}
        </Suspense>
      </div>
    </section>
  );
};

export default ReviewsArea;
