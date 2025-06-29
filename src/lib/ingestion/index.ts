import { randomUUID } from "crypto";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { eq } from "drizzle-orm";
import { ResultAsync, err, fromPromise, ok } from "neverthrow";
import { useDb } from "../../db";
import { log } from "../../logging";
import { ErrorWithStatus } from "../../safeRoute";
import type { Spotify } from "../spotify";
import { albums, userAlbums } from "../spotify/spotify.sql";
import { ingestionStatus } from "./ingestion.sql";

export namespace Ingestion {
  export class IngestionError extends ErrorWithStatus {
    constructor(...args: ConstructorParameters<typeof ErrorWithStatus>) {
      super(...args);
    }
  }

  export type IngestionStatus =
    | "pending"
    | "in_progress"
    | "completed"
    | "failed";

  export interface IngestionProgress {
    id: string;
    status: IngestionStatus;
    totalAlbums: number;
    processedAlbums: number;
    errorMessage?: string;
    startedAt: Date;
    completedAt?: Date;
  }

  // Start a new ingestion process
  export const startAlbumIngestion = (
    userId: string,
  ): ResultAsync<string, IngestionError> => {
    return useDb(async (db) => {
      const ingestionId = randomUUID();

      // Create ingestion status record
      await db.insert(ingestionStatus).values({
        id: ingestionId,
        userId,
        status: "pending",
        totalAlbums: 0,
        processedAlbums: 0,
      });

      log.info({ userId, ingestionId }, "Started album ingestion");
      return ingestionId;
    });
  };

  // Get ingestion progress
  export const getIngestionProgress = (
    userId: string,
  ): ResultAsync<IngestionProgress | null, IngestionError> => {
    return useDb(async (db) => {
      const result = await db
        .select()
        .from(ingestionStatus)
        .where(eq(ingestionStatus.userId, userId))
        .orderBy(ingestionStatus.createdAt)
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const status = result[0];
      if (!status) {
        return null;
      }

      return {
        id: status.id,
        status: status.status as IngestionStatus,
        totalAlbums: status.totalAlbums,
        processedAlbums: status.processedAlbums,
        errorMessage: status.errorMessage || undefined,
        startedAt: status.startedAt,
        completedAt: status.completedAt || undefined,
      };
    });
  };

  // Process albums in batches
  export const processAlbumBatch = async (
    spotify: SpotifyApi,
    offset: number = 0,
    limit: number = 50,
  ): Promise<
    ResultAsync<
      { albums: Spotify.AlbumData[]; hasMore: boolean },
      IngestionError
    >
  > => {
    return fromPromise(
      spotify.currentUser.albums.savedAlbums(limit as 50, offset),
      (e) =>
        new ErrorWithStatus(
          "Failed to fetch albums from Spotify",
          "INTERNAL_SERVER_ERROR",
          { cause: e },
        ),
    ).andThen((response) => {
      const albums: Spotify.AlbumData[] = response.items.map((item) => ({
        id: item.album.id,
        name: item.album.name,
        url: item.album.external_urls.spotify,
        img: item.album.images[1]?.url,
        artist: item.album.artists[0]?.name || "Unknown Artist",
        releaseDate: item.album.release_date,
        spotifyAddedAt: item.added_at,
      }));

      return ok({
        albums,
        hasMore: response.items.length === limit,
      });
    });
  };

  // Save albums to database
  export const saveAlbumsToDatabase = (
    userId: string,
    albumData: Spotify.AlbumData[],
  ): ResultAsync<void, IngestionError> => {
    return useDb(async (db) => {
      for (const album of albumData) {
        // Insert or update album
        await db
          .insert(albums)
          .values({
            id: album.id,
            name: album.name,
            url: album.url,
            img: album.img,
            artist: album.artist,
            releaseDate: album.releaseDate,
          })
          .onConflictDoUpdate({
            target: albums.id,
            set: {
              name: album.name,
              url: album.url,
              img: album.img,
              artist: album.artist,
              releaseDate: album.releaseDate,
            },
          });

        // Insert or update user album relationship
        await db
          .insert(userAlbums)
          .values({
            id: randomUUID(),
            userId,
            albumId: album.id,
            spotifyAddedAt: album.spotifyAddedAt,
          })
          .onConflictDoUpdate({
            target: [userAlbums.userId, userAlbums.albumId],
            set: {
              addedAt: new Date(),
              spotifyAddedAt: album.spotifyAddedAt,
            },
          });
      }
    });
  };

  // Update ingestion progress
  export const updateIngestionProgress = (
    ingestionId: string,
    updates: Partial<{
      status: IngestionStatus;
      totalAlbums: number;
      processedAlbums: number;
      errorMessage: string;
      completedAt: Date;
    }>,
  ): ResultAsync<void, Error> => {
    return useDb(async (db) => {
      const updateData: any = { ...updates };
      if (updates.completedAt) {
        updateData.completedAt = updates.completedAt;
      }

      await db
        .update(ingestionStatus)
        .set(updateData)
        .where(eq(ingestionStatus.id, ingestionId));
    });
  };

  // Main ingestion function
  export const ingestUserAlbums = async (
    spotify: SpotifyApi,
    userId: string,
  ): Promise<ResultAsync<void, IngestionError>> => {
    // Start ingestion
    const existingProgress = await getIngestionProgress(userId);
    if (existingProgress.isErr()) {
      return err(
        new IngestionError(
          "Could't check existing ingestion",
          "INTERNAL_SERVER_ERROR",
          {
            cause: existingProgress.error,
          },
        ),
      );
    }

    if (
      existingProgress.value &&
      (existingProgress.value.status === "pending" ||
        existingProgress.value.status === "in_progress")
    ) {
      return err(
        new IngestionError("Album ingestion already in progress", "CONFLICT"),
      );
    }
    const ingestionResult = await startAlbumIngestion(userId);
    if (ingestionResult.isErr()) {
      return err(ingestionResult.error);
    }

    const ingestionId = ingestionResult.value;

    // Update status to in progress
    await updateIngestionProgress(ingestionId, { status: "in_progress" });

    try {
      let offset = 0;
      let totalProcessed = 0;
      let hasMore = true;

      // Process albums in batches
      while (hasMore) {
        const batchResult = await processAlbumBatch(spotify, offset);
        if (batchResult.isErr()) {
          await updateIngestionProgress(ingestionId, {
            status: "failed",
            errorMessage: batchResult.error.message,
          });
          return err(batchResult.error);
        }

        const { albums, hasMore: batchHasMore } = batchResult.value;

        // Save albums to database
        const saveResult = await saveAlbumsToDatabase(userId, albums);
        if (saveResult.isErr()) {
          await updateIngestionProgress(ingestionId, {
            status: "failed",
            errorMessage: saveResult.error.message,
          });
          return err(saveResult.error);
        }

        totalProcessed += albums.length;
        offset += albums.length;
        hasMore = batchHasMore;

        // Update progress
        await updateIngestionProgress(ingestionId, {
          totalAlbums: totalProcessed,
          processedAlbums: totalProcessed,
        });

        log.info(
          { userId, ingestionId, processed: totalProcessed },
          "Processed album batch",
        );
      }

      // Mark as completed
      await updateIngestionProgress(ingestionId, {
        status: "completed",
        completedAt: new Date(),
      });

      log.info(
        { userId, ingestionId, totalProcessed },
        "Album ingestion completed",
      );
      return ok(undefined);
    } catch (error) {
      await updateIngestionProgress(ingestionId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      return err(
        new IngestionError("Ingestion failed", "INTERNAL_SERVER_ERROR", {
          cause: error,
        }),
      );
    }
  };
}
