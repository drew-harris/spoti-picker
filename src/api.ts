import { os, ORPCError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {} from "drizzle-orm";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino";
import { Err, Ok, errAsync, fromPromise } from "neverthrow";
import { z } from "zod";
import { auth } from "./auth";
import { log } from "./logging";
import { ErrorWithStatus, unwrap } from "./safeRoute";
import { buildSdkFromUserId } from "./spotify";

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
  const sdkResult = buildSdkFromUserId(context.session.user.id);

  return next({
    context: {
      ...context,
      spotify: await unwrap(sdkResult),
    },
  });
});

export const router = base.use(ensureUnwrap).router({
  album: {
    getAlbums: withSpotify.handler(async ({ context }) => {
      log.info({ user: context.session.user.id }, "Fetching albums");
      const albums = fromPromise(
        context.spotify.currentUser.albums.savedAlbums(50),
        () => new ErrorWithStatus("Couldn't get spotify profile", "NOT_FOUND"),
      ).andThen((prev) =>
        fromPromise(
          context.spotify.currentUser.albums.savedAlbums(50, 50),
          () =>
            new ErrorWithStatus("Couldn't get spotify profile", "NOT_FOUND"),
        ).map((n) => [...prev.items, ...n.items]),
      );
      return unwrap(albums);
    }),
  },
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
