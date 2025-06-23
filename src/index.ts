import { serve } from "bun";
import indexHtml from "../public/index.html";
import { api } from "./api";

serve({
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

console.log("Server started on port 3000");
