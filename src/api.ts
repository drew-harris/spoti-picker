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

export const router = os.use(ensureUnwrap).router({
  album: {
    getAlbums: os.handler(() => {
      const result = okAsync({ hello: "world" });
      return unwrap(result);
    }),
  },
});

const orpcHandler = new RPCHandler(router);

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
    const r = await orpcHandler.handle(c.req.raw, { prefix: "/api/orpc" });
    if (r.matched) {
      return r.response;
    } else {
      throw new Error("No matched route");
    }
  });
