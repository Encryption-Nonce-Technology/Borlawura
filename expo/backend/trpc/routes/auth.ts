import * as z from "zod";
import { eq } from "drizzle-orm";

import { db } from "../../db";
import { collectors, otpCodes, sessions, users } from "../../db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../create-context";

const roleSchema = z.enum(["user", "collector", "admin"]);
// Admin accounts are restricted to an allow-listed phone number. Falls back to the
// seeded demo admin phone so local/dev environments can reach the admin dashboard.
const ADMIN_PHONE = process.env.ADMIN_PHONE ?? "+233200000999";

const isOtpDebug = process.env.OTP_DEBUG === "true" || !process.env.OTP_PROVIDER_URL;

function generateOtpCode() {
  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

async function sendOtp(phone: string, code: string) {
  if (!process.env.OTP_PROVIDER_URL) {
    console.log(`[OTP MOCK] ${phone}: ${code}`);
    return;
  }

  const response = await fetch(process.env.OTP_PROVIDER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.OTP_PROVIDER_API_KEY
        ? { Authorization: `Bearer ${process.env.OTP_PROVIDER_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      to: phone,
      message: `Your ${process.env.OTP_BRAND_NAME ?? "Borlawura"} OTP is ${code}. Expires in 5 minutes.`,
      sender: process.env.OTP_SENDER_ID ?? "Borlawura",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OTP provider failed: ${response.status} ${text}`);
  }
}

export const authRouter = createTRPCRouter({
  requestOtp: publicProcedure
    .input(z.object({ phone: z.string().min(10) }))
    .mutation(async ({ input }) => {
      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await sendOtp(input.phone, code);

      await db
        .insert(otpCodes)
        .values({ phone: input.phone, code, expiresAt })
        .onConflictDoUpdate({
          target: otpCodes.phone,
          set: { code, expiresAt },
        });
      return { success: true, ...(isOtpDebug ? { codeForDev: code } : {}) };
    }),

  verifyOtp: publicProcedure
    .input(
      z.object({
        phone: z.string().min(10),
        code: z.string().length(6),
        name: z.string().min(2).default("Borlawura User"),
        role: roleSchema.default("user"),
      }),
    )
    .mutation(async ({ input }) => {
      const otp = await db.query.otpCodes.findFirst({
        where: eq(otpCodes.phone, input.phone),
      });
      if (!otp || otp.code !== input.code || otp.expiresAt.getTime() < Date.now()) {
        throw new Error("Invalid or expired OTP");
      }

      if (input.role === "admin" && input.phone !== ADMIN_PHONE) {
        throw new Error("This phone number is not authorized for admin access");
      }

      let user = await db.query.users.findFirst({ where: eq(users.phone, input.phone) });

      const ensureCollectorProfile = async (userId: string, name: string) => {
        const linked = await db.query.collectors.findFirst({
          where: eq(collectors.userId, userId),
        });
        if (!linked) {
          await db.insert(collectors).values({
            id: `c_${userId}`,
            userId,
            name,
            photo: "",
            licenseNumber: "pending-verification",
            vehicleType: "unassigned",
            rating: 5,
            isOnline: false,
          });
        }
      };

      if (!user) {
        const userId = `u_${Date.now()}`;
        const createdAt = new Date();
        await db.insert(users).values({
          id: userId,
          name: input.name,
          phone: input.phone,
          role: input.role,
          rating: 5,
          isActive: true,
          createdAt,
        });
        if (input.role === "collector") {
          await ensureCollectorProfile(userId, input.name);
        }
        user = await db.query.users.findFirst({ where: eq(users.id, userId) });
      } else if (input.role === "collector") {
        // Seeded demo accounts exist without a linked collector profile; backfill on sign-in.
        await ensureCollectorProfile(user.id, user.name);
      }

      const token = `token_${Date.now()}`;
      await db.insert(sessions).values({
        id: `s_${Date.now()}`,
        userId: user!.id,
        token,
        createdAt: new Date(),
      });

      await db.delete(otpCodes).where(eq(otpCodes.phone, input.phone));

      return { token, user };
    }),

  me: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const session = await db.query.sessions.findFirst({ where: eq(sessions.token, input.token) });
      if (!session) return null;
      return db.query.users.findFirst({ where: eq(users.id, session.userId) });
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await db.delete(sessions).where(eq(sessions.userId, ctx.user.id));
    return { success: true };
  }),
});

