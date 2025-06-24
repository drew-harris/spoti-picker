import { os, ORPCError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { and, eq } from "drizzle-orm";
import {} from "drizzle-orm";
import { Hono } from "hono";
import { Err, Ok, errAsync, fromPromise, okAsync } from "neverthrow";
import { auth } from "./auth";
import { schema, useDb } from "./db";
import { env } from "./env";
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
      const profile = fromPromise(
        context.spotify.currentUser.albums.savedAlbums(),
        (err) =>
          new ErrorWithStatus("Couldn't get spotify profile", "NOT_FOUND"),
      );
      return unwrap(profile);
    }),
  },
});

const orpcHandler = new RPCHandler(router);

type PossibleSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export const api = new Hono()
  .basePath("/api")
  // Logging middleware
  .use((c, next) => {
    console.log("Request received:", c.req.url.toString());
    return next();
  })
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
