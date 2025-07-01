import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./auth.sql.ts";
import * as spotifySchema from "./lib/spotify/spotify.sql.ts";

import { fromPromise } from "neverthrow";
import { rawDb } from "./db.ts";
import { env } from "./env";
import { ErrorWithStatus } from "./safeRoute.ts";

export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  database: drizzleAdapter(rawDb, {
    provider: "sqlite",
    schema: {
      ...authSchema,
      ...spotifySchema,
    },
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

export const getTokensFromUserId = (userId: string) => {
  return fromPromise(
    auth.api.getAccessToken({
      body: {
        providerId: "spotify",
        userId,
      },
    }),
    (e) =>
      new ErrorWithStatus(
        "Couldn't get access token",
        "INTERNAL_SERVER_ERROR",
        {
          cause: e,
        },
      ),
  );
};
