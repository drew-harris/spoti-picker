import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { and, eq } from "drizzle-orm";
import { errAsync, okAsync } from "neverthrow";
import { schema, useDb } from "./db";
import { env } from "./env";
import { ErrorWithStatus } from "./safeRoute";

export const buildSdkFromUserId = (userId: string) => {
  return useDb((db) =>
    db
      .select()
      .from(schema.account)
      .where(
        and(
          eq(schema.account.userId, userId),
          eq(schema.account.providerId, "spotify"),
        ),
      )
      .limit(1),
  ).andThen((account) => {
    if (account.length === 0) {
      return errAsync(
        new ErrorWithStatus("Couldn't find spotify account", "NOT_FOUND"),
      );
    } else {
      const singleAccount = account[0];
      if (!singleAccount?.accessToken || !singleAccount?.refreshToken) {
        return errAsync(
          new ErrorWithStatus("Couldn't find spotify tokens", "NOT_FOUND"),
        );
      }
      return okAsync(
        SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID, {
          access_token: singleAccount.accessToken,
          expires_in: 999999,
          refresh_token: singleAccount.refreshToken,
          token_type: "Bearer",
        }),
      );
    }
  });
};
