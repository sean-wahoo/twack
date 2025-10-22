import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getSession } from "@/lib/auth";
import type { Session } from "next-auth";
import prisma from "@/prisma/prisma";
import { PrismaClient } from "@/prisma/generated/prisma";

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

export async function createTRPCContext(opts?: CreateNextContextOptions) {
  const session = await getSession();
  const contextInner = await createContextInner({ session });

  return {
    ...contextInner,
    req: opts?.req,
    res: opts?.res,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      session: ctx.session,
    },
  });
});
