import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { rawDb } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(rawDb, {
    provider: "sqlite",
  }),
});
