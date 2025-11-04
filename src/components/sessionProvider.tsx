"use client";
import { SessionProvider } from "next-auth/react";
import { DevTools as JotaiDevTools } from "jotai-devtools";

const sessionProvider: React.FC<React.PropsWithChildren & { session: any }> = (
  props,
) => {
  const session = props.session ?? undefined;
  return <SessionProvider session={session}>{props.children}</SessionProvider>;
};

export default sessionProvider;
