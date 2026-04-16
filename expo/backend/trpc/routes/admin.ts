import { desc, eq, sql } from "drizzle-orm";

import { db } from "../../db";
import { pickups, users } from "../../db/schema";
import { createTRPCRouter, publicProcedure } from "../create-context";

export const adminRouter = createTRPCRouter({
  analytics: publicProcedure.query(async () => {
    const totalPickupsRow = await db.select({ count: sql<number>`count(*)` }).from(pickups);
    const activeUsersRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, true));
    const revenueRow = await db
      .select({ total: sql<number>`coalesce(sum(${pickups.price}), 0)` })
      .from(pickups)
      .where(eq(pickups.status, "collected"));

    return {
      totalPickups: totalPickupsRow[0]?.count ?? 0,
      activeUsers: activeUsersRow[0]?.count ?? 0,
      revenue: revenueRow[0]?.total ?? 0,
    };
  }),

  listUsers: publicProcedure.query(async () => {
    return db.query.users.findMany({ orderBy: [desc(users.createdAt)] });
  }),

  listCollectors: publicProcedure.query(async () => {
    return db.query.users.findMany({
      where: eq(users.role, "collector"),
      orderBy: [desc(users.createdAt)],
    });
  }),

  listRequests: publicProcedure.query(async () => {
    return db.query.pickups.findMany({ orderBy: [desc(pickups.createdAt)] });
  }),
});

