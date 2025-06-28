import { os, ORPCError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {} from "drizzle-orm";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino";
import { Err, Ok } from "neverthrow";
import { getIngestionProgress, ingestUserAlbums } from "./albumIngestion";
import { auth } from "./auth";
import { log } from "./logging";
import { unwrap } from "./safeRoute";
import { Spotify } from "./lib/spotify";

export type ApiType = typeof api;

const ensureUnwrap = os.middleware(async ({ next }) => {
  const value = await next();
  if (value.output instanceof Err || value.output instanceof Ok) {
    throw new ORPCError("NOT_ACCEPTABLE", {
      message: "UNWRAP NEVERTHROW ERRORS",
    });
  }
  return value;
});

const base = os.$context<{ session: PossibleSession }>();

const authedOnly = os
  .$context<{ session: PossibleSession }>()
  .use(async ({ next, context }) => {
    if (context.session) {
      return next({
        context: {
          session: context.session,
        },
      });
    }
    throw new ORPCError("NOT_AUTHORIZED", {
      message: "NOT_AUTHORIZED",
    });
  });

const withSpotify = authedOnly.use(async ({ next, context }) => {
  const sdkResult = Spotify.buildSdkFromUserId(context.session.user.id);
  return next({
    context: {
      ...context,
      spotify: await unwrap(sdkResult),
    },
  });
});

export const router = base.use(ensureUnwrap).router({
  album: {
    getAlbumsFromDatabase: authedOnly.handler(async ({ context }) => {
      const albums = Spotify.getUserAlbumsFromDatabase(context.session.user.id);
      return unwrap(albums);
    }),

    // Start album ingestion
    startIngestion: withSpotify.handler(async ({ context }) => {
      log.info({ user: context.session.user.id }, "Starting album ingestion");

      // Check if there's already an active ingestion
      const existingProgress = await getIngestionProgress(
        context.session.user.id,
      );
      if (existingProgress.isErr()) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to check existing ingestion",
        });
      }

      if (
        existingProgress.value &&
        (existingProgress.value.status === "pending" ||
          existingProgress.value.status === "in_progress")
      ) {
        throw new ORPCError("CONFLICT", {
          message: "Album ingestion already in progress",
        });
      }

      // Start ingestion in background
      ingestUserAlbums(context.spotify, context.session.user.id).then(
        (result) => {
          const awaitedResult = result;
          if (awaitedResult instanceof Err) {
            console.error(awaitedResult.error);
            log.error(
              { user: context.session.user.id, error: awaitedResult.error },
              "Album ingestion failed",
            );
          } else {
            log.info(
              { user: context.session.user.id },
              "Album ingestion completed successfully",
            );
          }
        },
      );

      return { success: true, message: "Album ingestion started" };
    }),

    // Get ingestion progress
    getIngestionProgress: authedOnly.handler(async ({ context }) => {
      const progress = getIngestionProgress(context.session.user.id);
      return unwrap(progress);
    }),
  },
  isDev: base.handler(async ({}) => {
    return process.env.NODE_ENV !== "production";
  }),
});

const orpcHandler = new RPCHandler(router);

type PossibleSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export const api = new Hono()
  .basePath("/api")
  // Logging middleware
  .use(
    pinoLogger({
      pino: { level: "warn" },
    }),
  )
  .on(["POST", "GET"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })
  .on(["POST", "GET"], "/orpc/*", async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    const r = await orpcHandler.handle(c.req.raw, {
      prefix: "/api/orpc",
      context: {
        session,
      },
    });
    if (r.matched) {
      return r.response;
    } else {
      throw new Error("No matched route");
    }
  });
