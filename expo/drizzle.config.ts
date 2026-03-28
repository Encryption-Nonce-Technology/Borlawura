import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './backend/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: './backend/db/sqlite.db',
    },
});
