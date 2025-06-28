import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/*.sql.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:./db.sqlite",
  },
});
