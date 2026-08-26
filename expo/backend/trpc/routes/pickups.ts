import * as z from "zod";
import { eq, and, ne } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";
import { db } from "../../db";
import { pickups, collectors, walletTransactions } from "../../db/schema";

const paymentMethodSchema = z.enum(["mtn_momo", "vodafone_cash", "airteltigo_cash"]);

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export const pickupsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        photos: z.array(z.string()).min(1).max(3),
        trashType: z.enum(["plastic", "organic", "mixed", "ewaste"]),
        quantity: z.enum(["small", "sack", "bin"]),
        location: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        address: z.string(),
        isUrgent: z.boolean().default(false),
        communityCode: z.string().optional(),
        subscriptionPlan: z.enum(["weekly", "monthly"]).optional(),
        paymentMethod: paymentMethodSchema.optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const priceMap = {
        small: 50,
        sack: 150,
        bin: 300,
      };
      const typeMultiplier = {
        plastic: 1.0,
        organic: 0.9,
        mixed: 1.2,
        ewaste: 1.5,
      };

      const onlineCollector = await db.query.collectors.findFirst({
        where: eq(collectors.isOnline, true),
      });
      const distanceKm =
        onlineCollector?.location != null
          ? haversineKm(onlineCollector.location, input.location)
          : 2;
      const distanceFee = Math.round(distanceKm * 10);
      const base = priceMap[input.quantity];
      const typeAdjusted = Math.round(base * typeMultiplier[input.trashType]);
      const urgencyFee = input.isUrgent ? 100 : 0;
      const communityDiscount = input.communityCode ? -25 : 0;
      const totalPrice = Math.max(20, typeAdjusted + distanceFee + urgencyFee + communityDiscount);

      const pickupId = `p${Date.now()}`;
      const newPickup = {
        id: pickupId,
        ...input,
        userId: ctx.user.id,
        distanceKm,
        price: totalPrice,
        paymentStatus: "pending",
        status: "searching",
        createdAt: new Date(),
        afterPhoto: null,
      };

      await db.insert(pickups).values(newPickup);

      // Simulate progressive assignment/tracking and movement.
      setTimeout(async () => {
        try {
          const assignedCollector = await db.query.collectors.findFirst({
            where: eq(collectors.isOnline, true)
          });

          if (assignedCollector) {
            await db.update(pickups)
              .set({
                collectorId: assignedCollector.id,
                status: "assigned",
                collectorLocation: assignedCollector.location,
                eta: 5
              })
              .where(eq(pickups.id, pickupId));

            setTimeout(async () => {
              await db
                .update(pickups)
                .set({
                  status: "on_way",
                  collectorLocation: {
                    latitude:
                      (assignedCollector.location?.latitude ?? input.location.latitude) * 0.7 +
                      input.location.latitude * 0.3,
                    longitude:
                      (assignedCollector.location?.longitude ?? input.location.longitude) * 0.7 +
                      input.location.longitude * 0.3,
                  },
                  eta: 3,
                })
                .where(eq(pickups.id, pickupId));
            }, 2500);

            setTimeout(async () => {
              await db
                .update(pickups)
                .set({
                  status: "arrived",
                  collectorLocation: input.location,
                  eta: 1,
                })
                .where(eq(pickups.id, pickupId));
            }, 5000);
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

  completePickup: publicProcedure
    .input(
      z.object({
        id: z.string(),
        collectorId: z.string(),
        afterPhoto: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      const pickup = await db.query.pickups.findFirst({ where: eq(pickups.id, input.id) });
      if (!pickup) throw new Error("Pickup not found");

      await db
        .update(pickups)
        .set({
          status: "collected",
          afterPhoto: input.afterPhoto,
          paymentStatus: "paid",
        })
        .where(eq(pickups.id, input.id));

      await db.insert(walletTransactions).values({
        id: `wt_${Date.now()}`,
        collectorId: input.collectorId,
        pickupId: input.id,
        amount: pickup.price,
        type: "earning",
        status: "completed",
        createdAt: new Date(),
      });

      return { success: true };
    }),

  updateCollectorLocation: publicProcedure
    .input(
      z.object({
        pickupId: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        eta: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(pickups)
        .set({
          collectorLocation: { latitude: input.latitude, longitude: input.longitude },
          ...(input.eta ? { eta: input.eta } : {}),
        })
        .where(eq(pickups.id, input.pickupId));
      return { success: true };
    }),

  getCollectorById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.query.collectors.findFirst({
        where: eq(collectors.id, input.id)
      });
    }),

  payForPickup: publicProcedure
    .input(
      z.object({
        pickupId: z.string(),
        method: paymentMethodSchema,
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(pickups)
        .set({ paymentMethod: input.method, paymentStatus: "paid" })
        .where(eq(pickups.id, input.pickupId));
      return { success: true };
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
