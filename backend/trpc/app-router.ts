import { createTRPCRouter } from "./create-context";
import { pickupsRouter } from "./routes/pickups";

export const appRouter = createTRPCRouter({
  pickups: pickupsRouter,
});

export type AppRouter = typeof appRouter;
