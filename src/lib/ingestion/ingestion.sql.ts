import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "../../auth.sql";

export const ingestionStatus = sqliteTable("ingestion_status", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "failed"],
  }).notNull(),
  totalAlbums: integer("total_albums").notNull().default(0),
  processedAlbums: integer("processed_albums").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: integer("started_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
