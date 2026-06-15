import { router } from "./trpc";
import { health } from "./routers/health";

export const appRouter = router({
    health,
});

export type AppRouter = typeof appRouter;
