import * as z from "zod";

import { createTRPCRouter, publicProcedure } from "../create-context";

type TrashType = "plastic" | "organic" | "mixed" | "ewaste";
type Quantity = "small" | "sack" | "bin";
type PickupStatus = "searching" | "assigned" | "on_way" | "arrived" | "collected" | "cancelled";

interface Pickup {
  id: string;
  userId: string;
  collectorId?: string;
  photos: string[];
  trashType: TrashType;
  quantity: Quantity;
  location: { latitude: number; longitude: number };
  address: string;
  price: number;
  status: PickupStatus;
  createdAt: Date;
  collectorLocation?: { latitude: number; longitude: number };
  eta?: number;
}

interface Collector {
  id: string;
  name: string;
  photo: string;
  licenseNumber: string;
  vehicleType: string;
  rating: number;
  isOnline: boolean;
  location?: { latitude: number; longitude: number };
}

const pickups: Pickup[] = [];
const collectors: Collector[] = [
  {
    id: "c1",
    name: "Kwame Mensah",
    photo: "https://i.pravatar.cc/150?img=12",
    licenseNumber: "GR-234-21",
    vehicleType: "Pickup Truck",
    rating: 4.8,
    isOnline: true,
    location: { latitude: 5.6037, longitude: -0.1870 },
  },
  {
    id: "c2",
    name: "Ama Osei",
    photo: "https://i.pravatar.cc/150?img=27",
    licenseNumber: "AS-567-19",
    vehicleType: "Van",
    rating: 4.9,
    isOnline: true,
    location: { latitude: 5.6100, longitude: -0.1950 },
  },
];

export const pickupsRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        photos: z.array(z.string()).min(1).max(3),
        trashType: z.enum(["plastic", "organic", "mixed", "ewaste"]),
        quantity: z.enum(["small", "sack", "bin"]),
        location: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        address: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const priceMap = {
        small: 50,
        sack: 150,
        bin: 300,
      };

      const pickup: Pickup = {
        id: `p${Date.now()}`,
        ...input,
        price: priceMap[input.quantity],
        status: "searching",
        createdAt: new Date(),
      };

      pickups.push(pickup);

      setTimeout(() => {
        const onlineCollector = collectors.find((c) => c.isOnline);
        if (onlineCollector) {
          pickup.collectorId = onlineCollector.id;
          pickup.status = "assigned";
          pickup.collectorLocation = onlineCollector.location;
          pickup.eta = 5;
        }
      }, 2000);

      return pickup;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return pickups.find((p) => p.id === input.id);
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
    .mutation(({ input }) => {
      const pickup = pickups.find((p) => p.id === input.id);
      if (pickup) {
        pickup.status = input.status;
        if (input.collectorLocation) {
          pickup.collectorLocation = input.collectorLocation;
        }
      }
      return pickup;
    }),

  getCollectorById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return collectors.find((c) => c.id === input.id);
    }),

  getActiveRequests: publicProcedure.query(() => {
    return pickups.filter((p) => p.status === "searching");
  }),

  getCollectorPickups: publicProcedure
    .input(z.object({ collectorId: z.string() }))
    .query(({ input }) => {
      return pickups.filter(
        (p) => p.collectorId === input.collectorId && p.status !== "collected",
      );
    }),
});
