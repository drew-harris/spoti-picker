import { Hono } from "hono";
import { auth } from "./auth";

export type ApiType = typeof api;

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
  .onError((err, c) => {
    console.error(err);
    if (err instanceof Error) {
      return c.json({ error: err.message }, 500);
    } else {
      return c.json({ error: "Unknown error" }, 500);
    }
  })
  .get("/test", async (c) => {
    return c.json({ name: "drew" });
  });
