import { serve } from "@hono/node-server";
import app from "./hono";
import { db } from "./db"; // Ensure DB is initialized

const port = 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
