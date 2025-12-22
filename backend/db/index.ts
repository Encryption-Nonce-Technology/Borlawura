import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Ensure the db directory exists or use a path relative to CWD
const dbPath = path.resolve(process.cwd(), "backend/db/sqlite.db");

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Initialize with some dummy collectors if empty
const result = sqlite.prepare("SELECT count(*) as count FROM collectors").get() as { count: number };

if (result.count === 0) {
    const dummyCollectors = [
        {
            id: "c1",
            name: "Kwame Mensah",
            photo: "https://i.pravatar.cc/150?img=12",
            licenseNumber: "GR-234-21",
            vehicleType: "Pickup Truck",
            rating: 4.8,
            isOnline: 1, // true in SQLite boolean mode (0/1)
            location: JSON.stringify({ latitude: 5.6037, longitude: -0.1870 }),
        },
        {
            id: "c2",
            name: "Ama Osei",
            photo: "https://i.pravatar.cc/150?img=27",
            licenseNumber: "AS-567-19",
            vehicleType: "Van",
            rating: 4.9,
            isOnline: 1,
            location: JSON.stringify({ latitude: 5.6100, longitude: -0.1950 }),
        },
    ];

    const insertStmt = sqlite.prepare(`
    INSERT INTO collectors (id, name, photo, license_number, vehicle_type, rating, is_online, location)
    VALUES (@id, @name, @photo, @licenseNumber, @vehicleType, @rating, @isOnline, @location)
  `);

    const insertTransaction = sqlite.transaction((collectors) => {
        for (const collector of collectors) insertStmt.run(collector);
    });

    insertTransaction(dummyCollectors);
    console.log("Seeded dummy collectors");
}
