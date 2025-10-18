import "dotenv/config";

import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "@/styling/globals.scss";
import SessionProvider from "@/components/sessionProvider";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";

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
  const session = await getSession();

  return (
    <TRPCReactProvider>
      <SessionProvider session={session}>
        <html lang="en">
          <body className={`${rubikFont.variable} ${rubikFont.variable}`}>
            <Navbar />
            {children}
          </body>
        </html>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
