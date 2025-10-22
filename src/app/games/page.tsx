import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import MainSection from "@/components/mainSection";

export default async function Home() {
  prefetch(trpc.igdb.getGames.queryOptions());
  return (
    <HydrateClient>
      <MainSection />
    </HydrateClient>
  );
}
