import { NextPage } from "next/types";
import styles from "./reviews.module.scss";
import ReviewsArea from "./reviewsArea";

const UserReviewsPage: NextPage<{
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  return (
    <main className={styles.reviews_area}>
      <h4>Your reviews</h4>
      <ReviewsArea userSlug={userSlug} />
    </main>
  );
};

export default UserReviewsPage;
