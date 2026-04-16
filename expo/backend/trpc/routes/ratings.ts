import * as z from "zod";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { reviews } from "../../db/schema";
import { createTRPCRouter, publicProcedure } from "../create-context";

export const ratingsRouter = createTRPCRouter({
  leaveReview: publicProcedure
    .input(
      z.object({
        pickupId: z.string(),
        fromUserId: z.string(),
        toUserId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = `rv_${Date.now()}`;
      await db.insert(reviews).values({
        id,
        pickupId: input.pickupId,
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        rating: Math.round(input.rating),
        comment: input.comment ?? null,
        createdAt: new Date(),
      });
      return { success: true, id };
    }),

  forUser: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
    return db.query.reviews.findMany({ where: eq(reviews.toUserId, input.userId) });
  }),
});

