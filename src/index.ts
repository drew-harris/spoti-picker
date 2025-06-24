import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import indexHtml from "../public/index.html";
import { api } from "./api";
import { rawDb } from "./db";
import { log } from "./logging";

Bun.serve({
  websocket: {
    message() {},
  },
  routes: {
    "/": indexHtml,
    "/api/**": async (req) => {
      return await api.fetch(req);
    },
    "/*": indexHtml,
  },
  fetch(req) {
    return api.fetch(req);
  },
  port: 3000,
  development: process.env.NODE_ENV !== "production",
});

migrate(rawDb, {
  migrationsFolder: "./drizzle",
});

log.info("Starting server");
