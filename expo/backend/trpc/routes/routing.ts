import * as z from "zod";
import { and, eq, ne } from "drizzle-orm";

import { db } from "../../db";
import { collectors, pickups } from "../../db/schema";
import { createTRPCRouter, publicProcedure } from "../create-context";

function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
}

export const routingRouter = createTRPCRouter({
  optimizeForCollector: publicProcedure
    .input(z.object({ collectorId: z.string() }))
    .query(async ({ input }) => {
      const collector = await db.query.collectors.findFirst({
        where: eq(collectors.id, input.collectorId),
      });
      if (!collector?.location) return [];

      const requests = await db.query.pickups.findMany({
        where: and(ne(pickups.status, "collected"), eq(pickups.status, "assigned")),
      });
      return requests
        .map((request) => ({
          ...request,
          routeDistanceKm: distanceKm(collector.location!, request.location),
        }))
        .sort((a, b) => a.routeDistanceKm - b.routeDistanceKm);
    }),
});

