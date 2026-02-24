import type { Metadata } from "next";
import { Domine, Inter, Rubik } from "next/font/google";
import "@/styling/globals.scss";
import localFont from "next/font/local";
import { TRPCReactProvider } from "@/trpc/client";
import { Suspense } from "react";
import { c } from "@/lib/utils";
import Navbar from "@/components/navbar";

const rubikFont = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const domine = Domine({
  variable: "--font-domine",
  subsets: ["latin"],
});

const iosevka = localFont({
  variable: "--font-iosevka",
  src: "./IosevkaNerdFont-Regular.ttf",
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
        <html lang="en">
          <body
            className={c(
              rubikFont.variable,
              rubikFont.className,
              inter.variable,
              inter.className,
              domine.variable,
              // domine.className,
              iosevka.variable,
              // iosevka.className,
            )}
          >
            <Navbar />
            {children}
          </body>
        </html>
      </Suspense>
    </TRPCReactProvider>
  );
}
