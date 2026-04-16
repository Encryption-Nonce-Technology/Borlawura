import { createTRPCRouter } from "./create-context";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { communityRouter } from "./routes/community";
import { pickupsRouter } from "./routes/pickups";
import { ratingsRouter } from "./routes/ratings";
import { routingRouter } from "./routes/routing";
import { subscriptionsRouter } from "./routes/subscriptions";
import { walletRouter } from "./routes/wallet";

export const appRouter = createTRPCRouter({
  admin: adminRouter,
  auth: authRouter,
  community: communityRouter,
  pickups: pickupsRouter,
  ratings: ratingsRouter,
  routing: routingRouter,
  subscriptions: subscriptionsRouter,
  wallet: walletRouter,
});

export type AppRouter = typeof appRouter;
