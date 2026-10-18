import { createRouter, publicQuery } from "./middleware";
import { eprRouter } from "./eprRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  epr: eprRouter,
});

export type AppRouter = typeof appRouter;
