"use client";

import { useTRPC } from "@/trpc/client";
import styles from "./reviews.module.scss";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import Review, { ReviewLoading } from "@/components/review";
import { Suspense } from "react";

const reviewsArea: React.FC<{ userSlug: string }> = ({ userSlug }) => {
  const trpc = useTRPC();
  const { data: userData, status: userStatus } = useSuspenseQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );
  if (userStatus === "error") {
    return <section>error!!</section>;
  }
  // if (userStatus === "pending") {
  //   return <section>loading...</section>;
  // }
  if (!userData) {
    notFound();
  }
  if (userData.reviews.length === 0) {
    return <section>no reviews yet!</section>;
  }
  return (
    <section className={styles.reviews_area}>
      <Suspense
        fallback={Array.from({ length: 3 }, (_, i) => (
          <ReviewLoading key={i} />
        ))}
      >
        {userData.reviews.map((review) => {
          return (
            <Review key={review.id} review={{ ...review, user: userData }} />
          );
        })}
      </Suspense>
    </section>
  );
};

export default reviewsArea;
