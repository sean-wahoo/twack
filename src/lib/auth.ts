import { getServerSession, User, Session, NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";
import type { User as PrismaUser } from "@/prisma/generated/prisma";
import { slugify } from "./utils";
import { AdapterUser } from "next-auth/adapters";

const DBAdapter = PrismaAdapter(prisma);

const authOptions: NextAuthOptions = {
  adapter: {
    ...DBAdapter,
    createUser: async (user: PrismaUser) => {
      let slug = slugify(user.name as string);

      try {
        let slugUser: AdapterUser | null = null;

        let attempts = 0;

        do {
          if (++attempts > 3) {
            console.log("alright bro damn nevermind");
            return user;
          }

          slug = slugify(user.name as string);
          slugUser = await DBAdapter.getUser!(user.id);
        } while (slugUser && "slug" in slugUser && slugUser.slug === slug);

        user.slug = slug;
        return user;
      } catch (e) {
        console.log({ createUserSlugError: e });
      } finally {
      }
      const createdUser = await DBAdapter.createUser!(user);

      return createdUser;
    },
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      const prismaUser = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
        select: { slug: true },
      });

      if (!prismaUser) {
        throw new Error("wtf??");
      }
      return {
        ...session,
        user: { ...session.user, id: user.id, slug: prismaUser.slug },
      };
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
