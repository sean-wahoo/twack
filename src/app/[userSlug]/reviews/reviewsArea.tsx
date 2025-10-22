"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

const reviewsArea: React.FC<{ userSlug: string }> = ({ userSlug }) => {
  const trpc = useTRPC();
  const { data: userData, status: userStatus } = useQuery(
    trpc.user.getUserBySlug.queryOptions({ slug: userSlug }),
  );
  if (userStatus === "error") {
    return <section>error!!</section>;
  }
  if (userStatus === "pending") {
    return <section>loading...</section>;
  }
  if (!userData) {
    notFound();
  }
  if (userData.reviews.length === 0) {
    return <section>no reviews yet!</section>;
  }
  return <section>hehah</section>;
};

export default reviewsArea;
