import { type User as PrismaUser } from "@/prisma/generated/prisma/client";
import { slugify } from "@/lib/utils";
import { PrismaClientValidationError } from "@/prisma/generated/prisma/internal/prismaNamespace";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/prisma/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { customSession } from "better-auth/plugins";

const options = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      slug: {
        type: "string",
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 5 * 60,
      refreshCache: false,
    },
  },
  databaseHooks: {
    user: {
      create: {
        async before(user, context) {
          console.log({ user, context });
          let slug = slugify(user.name as string);

          try {
            let slugUser: PrismaUser | null = null;

            let attempts = 0;

            do {
              if (++attempts > 3) {
                console.log("alright bro damn nevermind");
                return { data: user };
              }

              slug = slugify(user.name as string);
              try {
                slugUser = await prisma.user.findFirstOrThrow({
                  where: { id: user.id },
                });
              } catch (e) {
                if (
                  e instanceof PrismaClientValidationError &&
                  e.message.includes(
                    "needs at least one of `id` or `email` arguments.",
                  )
                ) {
                  console.log("just say you couldn't find it jeez");
                  continue;
                }
              }
            } while (slugUser && "slug" in slugUser && slugUser.slug === slug);

            user.slug = slug;
          } catch (e) {
            console.log({ createUserSlugError: e });
          }
          return { data: user };
        },
      },
    },
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },
  experimental: {
    joins: true,
  },
  plugins: [nextCookies()],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }, ctx) => {
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
        user: { ...user, id: user.id, slug: prismaUser.slug },
      };
    }),
  ],
});

export type GetSessionInterface = Awaited<
  ReturnType<typeof auth.api.getSession>
>;

export const getSession: () => Promise<GetSessionInterface> = async () => {
  const sessionHeaders = await headers();
  const sessionReturn = await auth.api.getSession({ headers: sessionHeaders });
  return sessionReturn;
};
