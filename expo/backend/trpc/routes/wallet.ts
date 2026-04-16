import * as z from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { walletTransactions, withdrawals } from "../../db/schema";
import { createTRPCRouter, publicProcedure } from "../create-context";

const withdrawMethod = z.enum(["mtn_momo", "vodafone_cash", "airteltigo_cash"]);

export const walletRouter = createTRPCRouter({
  summary: publicProcedure
    .input(z.object({ collectorId: z.string() }))
    .query(async ({ input }) => {
      const row = await db
        .query.walletTransactions.findMany({
          where: eq(walletTransactions.collectorId, input.collectorId),
        });

      return {
        totalEarnings: row.reduce((sum, tx) => {
          if (tx.type === "earning" && tx.status === "completed") return sum + tx.amount;
          if (tx.type === "withdrawal" && tx.status === "completed") return sum - tx.amount;
          return sum;
        }, 0),
        completedJobs: row.filter((tx) => tx.type === "earning" && tx.status === "completed").length,
      };
    }),

  history: publicProcedure
    .input(z.object({ collectorId: z.string() }))
    .query(async ({ input }) => {
      return db.query.walletTransactions.findMany({
        where: eq(walletTransactions.collectorId, input.collectorId),
        orderBy: [desc(walletTransactions.createdAt)],
      });
    }),

  requestWithdrawal: publicProcedure
    .input(
      z.object({
        collectorId: z.string(),
        amount: z.number().positive(),
        method: withdrawMethod,
      }),
    )
    .mutation(async ({ input }) => {
      const id = `wd_${Date.now()}`;
      await db.insert(withdrawals).values({
        id,
        collectorId: input.collectorId,
        amount: input.amount,
        method: input.method,
        status: "requested",
        createdAt: new Date(),
      });
      await db.insert(walletTransactions).values({
        id: `wt_${Date.now()}`,
        collectorId: input.collectorId,
        pickupId: null,
        withdrawalId: id,
        amount: input.amount,
        type: "withdrawal",
        status: "pending",
        createdAt: new Date(),
      });
      return { success: true, withdrawalId: id };
    }),

  listWithdrawals: publicProcedure
    .input(z.object({ collectorId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (input?.collectorId) {
        return db.query.withdrawals.findMany({
          where: eq(withdrawals.collectorId, input.collectorId),
          orderBy: [desc(withdrawals.createdAt)],
        });
      }
      return db.query.withdrawals.findMany({ orderBy: [desc(withdrawals.createdAt)] });
    }),

  setWithdrawalStatus: publicProcedure
    .input(
      z.object({
        withdrawalId: z.string(),
        status: z.enum(["paid", "failed"]),
      }),
    )
    .mutation(async ({ input }) => {
      const withdrawal = await db.query.withdrawals.findFirst({
        where: eq(withdrawals.id, input.withdrawalId),
      });
      if (!withdrawal) throw new Error("Withdrawal not found");

      await db
        .update(withdrawals)
        .set({ status: input.status })
        .where(eq(withdrawals.id, input.withdrawalId));

      await db
        .update(walletTransactions)
        .set({ status: input.status === "paid" ? "completed" : "failed" })
        .where(eq(walletTransactions.withdrawalId, input.withdrawalId));

      return { success: true };
    }),
});

