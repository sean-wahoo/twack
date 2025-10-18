import { getServerSession, User, Session } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session({ session, user }: { session: Session; user: User }) {
      return { ...session, user: { ...session.user, id: user.id } };
    },
  },
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
