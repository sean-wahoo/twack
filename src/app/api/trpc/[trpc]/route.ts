import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { NextResponse } from "next/server";
import {
  createNextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "@trpc/server/adapters/next";

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (req.method === "OPTIONS") {
//     res.writeHead(200);
//     return res.end();
//   }
//   return nextApiHandler(req, res);
// };
const handler = async (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };

// export default handler;
