import { initTRPC } from "@trpc/server";
import superjson from 'superjson';

const t = initTRPC.create({
    transformer: superjson
});

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const reqHeaders = opts.headers;
    console.log("[ctx] nova requisição recebida");
    console.log("[ctx] user-agent:", opts.headers);
    return {
        reqHeaders
    }
};

export const router = t.router;
export const publicProcedure = t.procedure;