import * as z from "zod";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { subscriptions } from "../../db/schema";
import { createTRPCRouter, publicProcedure } from "../create-context";

const planSchema = z.enum(["weekly", "monthly"]);

export const subscriptionsRouter = createTRPCRouter({
  plans: publicProcedure.query(() => {
    return [
      { id: "weekly", label: "Weekly pickup", price: 200 },
      { id: "monthly", label: "Monthly waste plan", price: 700 },
    ];
  }),

  subscribe: publicProcedure
    .input(z.object({ userId: z.string(), plan: planSchema }))
    .mutation(async ({ input }) => {
      const price = input.plan === "weekly" ? 200 : 700;
      const nextPickupAt =
        input.plan === "weekly"
          ? new Date(Date.now() + 7 * 24 * 3600 * 1000)
          : new Date(Date.now() + 30 * 24 * 3600 * 1000);
      const id = `sub_${Date.now()}`;
      await db.insert(subscriptions).values({
        id,
        userId: input.userId,
        plan: input.plan,
        status: "active",
        price,
        nextPickupAt,
        createdAt: new Date(),
      });
      return { success: true, id };
    }),

  getForUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => db.query.subscriptions.findMany({ where: eq(subscriptions.userId, input.userId) })),
});

