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
  status: text("status").notNull(), // "searching" | "assigned" | "on_way" | "arrived" | "collected" | "cancelled"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  collectorLocation: text("collector_location", { mode: "json" })
    .$type<{ latitude: number; longitude: number }>()
    .optional(),
  eta: integer("eta").optional(),
});

export const collectors = sqliteTable("collectors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo").notNull(),
  licenseNumber: text("license_number").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  rating: real("rating").notNull(),
  isOnline: integer("is_online", { mode: "boolean" }).notNull(),
  location: text("location", { mode: "json" })
    .$type<{ latitude: number; longitude: number }>()
    .optional(),
});
