import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { auth, getSession } from "@/lib/auth/server";
import { prisma } from "@/prisma/prisma";
import { PrismaClient } from "@/prisma/generated/prisma/client";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

type CreateInnerContextOptions = Partial<CreateNextContextOptions> & {
  session: typeof auth.$Infer.Session | null;
  prisma: PrismaClient;
};

export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    prisma: opts?.prisma ?? (prisma as PrismaClient),
    session: opts?.session ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

export async function createTRPCContext(opts?: FetchCreateContextFnOptions) {
  const session = await getSession();
  const contextInner = await createContextInner({
    session: session ?? null,
    prisma,
  });

  return {
    ...contextInner,
    req: opts?.req,
  };
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { session } = ctx;
  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "failed to auth sily",
    });
  }
  return next({
    ctx: {
      session: session,
    },
  });
});
