import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { desc, eq } from "drizzle-orm";
import { ResultAsync, fromPromise } from "neverthrow";
import { auth } from "../../auth";
import { useDb } from "../../db";
import { env } from "../../env";
import { ErrorWithStatus } from "../../safeRoute";
import { albums, userAlbums } from "./spotify.sql";

export namespace Spotify {
  export interface AlbumData {
    id: string;
    name: string;
    url: string;
    img?: string;
    artist: string;
    releaseDate?: string;
    spotifyAddedAt?: string;
  }

  export class SpotifyError extends ErrorWithStatus {
    constructor(...args: ConstructorParameters<typeof ErrorWithStatus>) {
      super(...args);
    }
  }

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
      () => new SpotifyError("Couldn't get spotify profile", "NOT_FOUND"),
    ).andThen((prev) =>
      fromPromise(
        spotify.currentUser.albums.savedAlbums(50, 50),
        () => new SpotifyError("Couldn't get spotify profile", "NOT_FOUND"),
      ).map((n) => [...prev.items, ...n.items]),
    );
    return albums;
  };

  // Get user's albums from database
  export const getUserAlbumsFromDatabase = (
    userId: string,
  ): ResultAsync<AlbumData[], SpotifyError> => {
    return useDb(async (db) => {
      const result = await db
        .select({
          id: albums.id,
          name: albums.name,
          url: albums.url,
          img: albums.img,
          artist: albums.artist,
          releaseDate: albums.releaseDate,
          spotifyAddedAt: userAlbums.spotifyAddedAt,
        })
        .from(userAlbums)
        .innerJoin(albums, eq(userAlbums.albumId, albums.id))
        .where(eq(userAlbums.userId, userId))
        .orderBy(desc(userAlbums.spotifyAddedAt));

      return result.map((row) => ({
        id: row.id,
        name: row.name,
        url: row.url || "",
        img: row.img || undefined,
        artist: row.artist || "Unknown Artist",
        releaseDate: row.releaseDate || undefined,
        spotifyAddedAt: row.spotifyAddedAt || undefined,
      }));
    });
  };
}
