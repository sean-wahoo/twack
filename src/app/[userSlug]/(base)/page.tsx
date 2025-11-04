import styles from "../page.module.scss";
import {
  ProfileBody,
  ProfileBodyLoading,
  ProfileHeader,
  ProfileHeaderLoading,
} from "../profile";
import { NextPage } from "next";
import { Suspense } from "react";

const UserPage: NextPage<{
  children: React.ReactNode;
  params: Promise<{ userSlug: string }>;
}> = async ({ params }) => {
  const { userSlug } = await params;
  return (
    <>
      <Suspense fallback={<ProfileHeaderLoading />}>
        <ProfileHeader userSlug={userSlug} />
      </Suspense>
      {/* <Suspense fallback={<ProfileBodyLoading />}> */}
      <ProfileBody userSlug={userSlug} />
      {/* </Suspense> */}
    </>
  );
};
export default UserPage;
