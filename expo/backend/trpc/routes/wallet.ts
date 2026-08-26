import * as z from "zod";
import { desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { walletTransactions, withdrawals } from "../../db/schema";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../create-context";

const withdrawMethod = z.enum(["mtn_momo", "vodafone_cash", "airteltigo_cash"]);

export const walletRouter = createTRPCRouter({
  summary: protectedProcedure.query(async ({ ctx }) => {
      const collectorId = `c_${ctx.user.id}`;
      const row = await db
        .query.walletTransactions.findMany({
          where: eq(walletTransactions.collectorId, collectorId),
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

  history: protectedProcedure.query(async ({ ctx }) => {
      const collectorId = `c_${ctx.user.id}`;
      return db.query.walletTransactions.findMany({
        where: eq(walletTransactions.collectorId, collectorId),
        orderBy: [desc(walletTransactions.createdAt)],
      });
    }),

  requestWithdrawal: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        method: withdrawMethod,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const collectorId = `c_${ctx.user.id}`;
      const id = `wd_${Date.now()}`;
      await db.insert(withdrawals).values({
        id,
        collectorId,
        amount: input.amount,
        method: input.method,
        status: "requested",
        createdAt: new Date(),
      });
      await db.insert(walletTransactions).values({
        id: `wt_${Date.now()}`,
        collectorId,
        pickupId: null,
        withdrawalId: id,
        amount: input.amount,
        type: "withdrawal",
        status: "pending",
        createdAt: new Date(),
      });
      return { success: true, withdrawalId: id };
    }),

  listWithdrawals: adminProcedure.query(async () => {
      return db.query.withdrawals.findMany({ orderBy: [desc(withdrawals.createdAt)] });
    }),

  setWithdrawalStatus: adminProcedure
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

