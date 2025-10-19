import { NextPage } from "next";
import { getSession } from "@/lib/auth";

const UserLayout: NextPage<{
  children: React.ReactNode;
}> = async ({ children }) => {
  const session = await getSession();

  return <>{children}</>;
};
export default UserLayout;
