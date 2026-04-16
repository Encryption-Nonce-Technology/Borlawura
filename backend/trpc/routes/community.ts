import * as z from "zod";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { communityGroups, pickups } from "../../db/schema";
import { createTRPCRouter, publicProcedure } from "../create-context";

export const communityRouter = createTRPCRouter({
  listGroups: publicProcedure.query(async () => {
    return db.query.communityGroups.findMany();
  }),

  groupRequests: publicProcedure
    .input(z.object({ communityCode: z.string() }))
    .query(async ({ input }) => {
      return db.query.pickups.findMany({ where: eq(pickups.communityCode, input.communityCode) });
    }),
});

