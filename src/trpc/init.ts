import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import prisma from "@/prisma/prisma";
import { PrismaClient } from "@/prisma/generated/prisma";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { Decimal } from "@prisma/client/runtime/library";

interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
  session: Session | null;
  prisma?: PrismaClient | null;
}

export async function createContextInner(opts?: CreateInnerContextOptions) {
  return {
    prisma,
    session: opts?.session,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

export async function createTRPCContext(opts?: FetchCreateContextFnOptions) {
  const session = await auth();
  console.log({ session });
  const contextInner = await createContextInner({ session });

  return {
    ...contextInner,
    session,
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
  console.log({ ctx });
  const { session } = ctx;
  if (!session?.user) {
    console.log({ ctx });
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
