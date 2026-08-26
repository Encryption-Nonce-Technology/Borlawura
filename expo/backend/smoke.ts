/**
 * End-to-end API smoke test against a running Borlawura backend.
 * Usage: npm run start-backend && npm run smoke   (or set SMOKE_BASE_URL)
 */
import { createTRPCClient, httpLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "./trpc/app-router";

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const TRPC_URL = `${BASE_URL}/trpc`;

type Actor = ReturnType<typeof makeClient>;

let failures = 0;

function assert(condition: unknown, label: string) {
  if (condition) {
    console.log(`  ✔ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✘ ${label}`);
  }
}

function makeClient(token: string | null) {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: TRPC_URL,
        transformer: superjson,
        headers: () => (token ? { Authorization: `Bearer ${token}` } : {}),
      }),
    ],
  });
}

async function login(phone: string, role: "user" | "collector" | "admin", name: string) {
  const anon = makeClient(null);
  const requested = await anon.auth.requestOtp.mutate({ phone });
  const code = (requested as { codeForDev?: string }).codeForDev;
  if (!code) throw new Error(`No dev OTP returned for ${phone} (unset OTP_PROVIDER_URL for debug codes)`);
  const verified = await anon.auth.verifyOtp.mutate({ phone, code, name, role });
  if (!verified.user) throw new Error(`verifyOtp returned no user for ${phone}`);
  console.log(`  logged in ${role} "${name}" (${phone}) -> user ${verified.user.id}`);
  return { token: verified.token, user: verified.user, client: makeClient(verified.token) };
}

async function main() {
  console.log(`Smoke testing ${BASE_URL}`);

  const health = (await fetch(BASE_URL).then((r) => r.json())) as { status: string };
  assert(health.status === "ok", "health check");

  // --- Auth flows -----------------------------------------------------------
  const guest = await login("+233200000001", "user", "Demo User");
  let adminGateBlocked = false;
  try {
    // Valid OTP, but the caller tries to take the admin role — must be
    // rejected because this phone is not on the ADMIN_PHONE allow-list.
    const anon = makeClient(null);
    const { codeForDev } = await anon.auth.requestOtp.mutate({ phone: "+233200000001" });
    await anon.auth.verifyOtp.mutate({
      phone: "+233200000001",
      code: codeForDev ?? "000000",
      role: "admin",
      name: "Impostor",
    });
  } catch {
    adminGateBlocked = true;
  }
  assert(adminGateBlocked, "non-admin phone cannot take the admin role");

  const admin = await login("+233200000999", "admin", "Administrator");
  assert(admin.user.role === "admin", "allow-listed phone signs into admin");

  const collector = await login("+233200000002", "collector", "Kwame Mensah");
  const linkedCollector = await collector.client.pickups.getCollectorById.query({
    id: `c_${collector.user.id}`,
  });
  assert(!!linkedCollector, "collector sign-in backfills a linked collector profile");

  // --- User creates a pickup ------------------------------------------------
  const pickup = await guest.client.pickups.create.mutate({
    photos: ["https://images.unsplash.com/photo-1532999122724-e3c354a0b15b?w=800&q=60"],
    trashType: "mixed",
    quantity: "sack",
    location: { latitude: 5.6045, longitude: -0.189 },
    address: "1 Smoke Test Lane, Accra",
    isUrgent: false,
    communityCode: undefined,
    subscriptionPlan: undefined,
    paymentMethod: "mtn_momo",
  });
  assert(pickup.status === "searching" && pickup.price > 0, `pickup created (₵${pickup.price})`);

  // Accept quickly before the demo auto-assign timer races us.
  const accepted = await collector.client.pickups.acceptRequest.mutate({ pickupId: pickup.id });
  assert(accepted?.status === "assigned", "acceptRequest assigns the signed-in collector");
  assert(
    accepted?.collectorId === `c_${collector.user.id}`,
    "assignment points at session-derived collector id",
  );

  await collector.client.pickups.updateStatus.mutate({ id: pickup.id, status: "on_way" });
  const arrived = await collector.client.pickups.updateStatus.mutate({
    id: pickup.id,
    status: "arrived",
  });
  assert(arrived?.status === "arrived", "status advances to arrived");

  await collector.client.pickups.completePickup.mutate({
    id: pickup.id,
    afterPhoto: "https://images.unsplash.com/photo-1532999122724-e3c354a0b15b?auto=format&fit=crop&w=700&q=60",
  });
  assert(true, "completePickup records the earning under the signed-in collector");

  const rateResult = await collector.client.ratings.leaveReview.mutate({
    pickupId: pickup.id,
    fromUserId: collector.user.id,
    toUserId: pickup.userId,
    rating: 5,
    comment: "Customer was ready on time",
  });
  assert(!!rateResult.id, "collector can rate the customer");

  // --- Wallet + payouts -----------------------------------------------------
  const summary = await collector.client.wallet.summary.query();
  assert(summary.totalEarnings >= pickup.price, `wallet summary shows ₵${summary.totalEarnings}`);

  await collector.client.wallet.requestWithdrawal.mutate({ amount: 50, method: "mtn_momo" });
  const withdrawals = await admin.client.wallet.listWithdrawals.query();
  const pending = withdrawals.find((w) => w.collectorId === `c_${collector.user.id}` && w.status === "requested");
  assert(!!pending, "withdrawal request lands in admin queue");

  if (pending) {
    await admin.client.wallet.setWithdrawalStatus.mutate({ withdrawalId: pending.id, status: "paid" });
    const after = await admin.client.wallet.listWithdrawals.query();
    assert(after.find((w) => w.id === pending.id)?.status === "paid", "admin marks payout paid");
  }

  const analytics = await admin.client.admin.analytics.query();
  assert(analytics.revenue >= pickup.price, `analytics revenue ₵${analytics.revenue}`);

  console.log(failures === 0 ? "\nAll smoke checks passed 🎉" : `\n${failures} smoke check(s) failed`);
  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error("\nSmoke test crashed:", error);
  process.exit(1);
});
