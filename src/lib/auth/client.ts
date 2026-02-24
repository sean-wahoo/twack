import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import { auth } from "@/lib/auth/server";

const { signIn, signOut, useSession, getSession, $Infer } = createAuthClient({
  baseURL: process.env.BASE_URL,
  plugins: [customSessionClient<typeof auth>()],
});

export const exportSignIn = async () => {
  const data = await signIn.social({
    provider: "discord",
  });
  console.log({ data });
};

export { signIn, signOut, useSession, getSession, $Infer };
export type Session = typeof $Infer.Session;
