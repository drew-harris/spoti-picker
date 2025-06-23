import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { rawDb, schema } from "./db";
import { env } from "./env";

export const auth = betterAuth({
  database: drizzleAdapter(rawDb, {
    provider: "sqlite",
    schema: schema,
  }),

  socialProviders: {
    spotify: {
      enabled: true,
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      scope: [
        "user-read-playback-position",
        "user-top-read",
        "user-read-recently-played",
        "user-library-read",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "user-read-playback-state",
      ],
    },
  },
});
