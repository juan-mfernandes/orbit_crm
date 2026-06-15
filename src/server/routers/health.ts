import { publicProcedure, router } from "../trpc";

export const health = router({
    ping: publicProcedure.query( () => {
        return {
            status: "OK",
            timestamp: new Date(),
        }
    }),
});