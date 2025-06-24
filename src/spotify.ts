import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { fromPromise } from "neverthrow";
import { auth } from "./auth";
import { env } from "./env";
import { ErrorWithStatus } from "./safeRoute";

export const buildSdkFromUserId = (userId: string) =>
  fromPromise(
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
  ).map((tokens) =>
    SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID, {
      access_token: tokens.accessToken!,
      token_type: "Bearer",
      expires_in: 9999,
      refresh_token: "", // Better auth handles refresh
    }),
  );

export const getUsersAlbums = (spotify: SpotifyApi) => {
  const albums = fromPromise(
    spotify.currentUser.albums.savedAlbums(50),
    () => new ErrorWithStatus("Couldn't get spotify profile", "NOT_FOUND"),
  ).andThen((prev) =>
    fromPromise(
      spotify.currentUser.albums.savedAlbums(50, 50),
      () => new ErrorWithStatus("Couldn't get spotify profile", "NOT_FOUND"),
    ).map((n) => [...prev.items, ...n.items]),
  );
  return albums;
};
