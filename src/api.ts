import { os, ORPCError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { Err, Ok, okAsync } from "neverthrow";
import { auth } from "./auth";
import { unwrap } from "./safeRoute";

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

export const router = base.use(ensureUnwrap).router({
  album: {
    getAlbums: authedOnly.handler(({ context }) => {
      const result = okAsync({ youAre: context.session.user.id });
      return unwrap(result);
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
