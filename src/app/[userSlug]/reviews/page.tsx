import { NextPage } from "next/types";
import styles from "./reviews.module.scss";
import ReviewsArea from "./reviewsArea";

const UserReviewsPage: NextPage<{
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  return (
    <main className={styles.main_reviews_area}>
      <h2>Your reviews</h2>
      <ReviewsArea userSlug={userSlug} />
    </main>
  );
};

export default UserReviewsPage;
