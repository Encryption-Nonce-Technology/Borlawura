import * as z from "zod";
import { eq, and, ne } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "../create-context";
import { db } from "../../db";
import { pickups, collectors } from "../../db/schema";
import { alias } from "drizzle-orm/sqlite-core";

export const pickupsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        photos: z.array(z.string()).min(1).max(3),
        trashType: z.enum(["plastic", "organic", "mixed", "ewaste"]),
        quantity: z.enum(["small", "sack", "bin"]),
        location: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        address: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const priceMap = {
        small: 50,
        sack: 150,
        bin: 300,
      };

      const pickupId = `p${Date.now()}`;
      const newPickup = {
        id: pickupId,
        ...input,
        price: priceMap[input.quantity],
        status: "searching",
        createdAt: new Date(),
      };

      await db.insert(pickups).values(newPickup);

      // Simulate assignment logic
      // In a real app, this might be a background job
      setTimeout(async () => {
        try {
          // Find an online collector
          const onlineCollector = await db.query.collectors.findFirst({
            where: eq(collectors.isOnline, true)
          });

          if (onlineCollector) {
            await db.update(pickups)
              .set({
                collectorId: onlineCollector.id,
                status: "assigned",
                collectorLocation: onlineCollector.location,
                eta: 5
              })
              .where(eq(pickups.id, pickupId));
          }
        } catch (e) {
          console.error("Error assigning collector:", e);
        }
      }, 2000);

      return newPickup;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.query.pickups.findFirst({
        where: eq(pickups.id, input.id)
      });
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["searching", "assigned", "on_way", "arrived", "collected", "cancelled"]),
        collectorLocation: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.update(pickups)
        .set({
          status: input.status,
          ...(input.collectorLocation ? { collectorLocation: input.collectorLocation } : {})
        })
        .where(eq(pickups.id, input.id));

      return db.query.pickups.findFirst({ where: eq(pickups.id, input.id) });
    }),

  getCollectorById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.query.collectors.findFirst({
        where: eq(collectors.id, input.id)
      });
    }),

  getActiveRequests: publicProcedure.query(async () => {
    return db.query.pickups.findMany({
      where: eq(pickups.status, "searching")
    });
  }),

  getCollectorPickups: publicProcedure
    .input(z.object({ collectorId: z.string() }))
    .query(async ({ input }) => {
      return db.query.pickups.findMany({
        where: and(
          eq(pickups.collectorId, input.collectorId),
          ne(pickups.status, "collected")
        )
      });
    }),
});
