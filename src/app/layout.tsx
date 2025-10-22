import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/styling/globals.scss";
import SessionProvider from "@/components/sessionProvider";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";
import { Suspense } from "react";

const rubikFont = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "twack",
  description: "twick twack",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <Suspense>
        <SessionWrapper>
          <html lang="en">
            <body className={`${rubikFont.variable} ${rubikFont.variable}`}>
              <Navbar />
              {children}
            </body>
          </html>
        </SessionWrapper>
      </Suspense>
    </TRPCReactProvider>
  );
}

const SessionWrapper = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
