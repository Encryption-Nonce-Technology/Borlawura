import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const pickups = sqliteTable("pickups", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  collectorId: text("collector_id"),
  photos: text("photos", { mode: "json" }).$type<string[]>().notNull(),
  trashType: text("trash_type").notNull(), // "plastic" | "organic" | "mixed" | "ewaste"
  quantity: text("quantity").notNull(), // "small" | "sack" | "bin"
  location: text("location", { mode: "json" })
    .$type<{ latitude: number; longitude: number }>()
    .notNull(),
  address: text("address").notNull(),
  price: integer("price").notNull(),
  distanceKm: real("distance_km"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  isUrgent: integer("is_urgent", { mode: "boolean" }),
  communityCode: text("community_code"),
  subscriptionPlan: text("subscription_plan"),
  status: text("status").notNull(), // "searching" | "assigned" | "on_way" | "arrived" | "collected" | "cancelled"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  collectorLocation: text("collector_location", { mode: "json" })
    .$type<{ latitude: number; longitude: number }>(),
  eta: integer("eta"),
  afterPhoto: text("after_photo"),
});

export const collectors = sqliteTable("collectors", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  photo: text("photo").notNull(),
  licenseNumber: text("license_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  rating: real("rating").notNull(),
  isOnline: integer("is_online", { mode: "boolean" }).notNull(),
  location: text("location", { mode: "json" })
    .$type<{ latitude: number; longitude: number }>(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull(), // "user" | "collector" | "admin"
  rating: real("rating").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const otpCodes = sqliteTable("otp_codes", {
  phone: text("phone").primaryKey(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  pickupId: text("pickup_id").notNull(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  plan: text("plan").notNull(), // "weekly" | "monthly"
  status: text("status").notNull(), // "active" | "paused" | "cancelled"
  price: integer("price").notNull(),
  nextPickupAt: integer("next_pickup_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const walletTransactions = sqliteTable("wallet_transactions", {
  id: text("id").primaryKey(),
  collectorId: text("collector_id").notNull(),
  pickupId: text("pickup_id"),
  withdrawalId: text("withdrawal_id"),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // "earning" | "withdrawal"
  status: text("status").notNull(), // "completed" | "pending"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const withdrawals = sqliteTable("withdrawals", {
  id: text("id").primaryKey(),
  collectorId: text("collector_id").notNull(),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // "mtn_momo" | "vodafone_cash" | "airteltigo_cash"
  status: text("status").notNull(), // "requested" | "paid" | "failed"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const communityGroups = sqliteTable("community_groups", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  location: text("location", { mode: "json" }).$type<{ latitude: number; longitude: number }>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
