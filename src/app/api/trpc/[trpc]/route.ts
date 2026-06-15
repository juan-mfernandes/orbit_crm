import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/_app";
import { createTRPCContext } from "@/server/trpc";

const handler = ( req: Request) => {
    const result = fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext:  () => createTRPCContext({ headers: req.headers })
    });

    return result;
};

export { handler as GET, handler as POST };