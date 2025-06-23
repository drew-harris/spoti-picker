import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const changelog = pgTable("changelogs", {
  id: text("id").primaryKey().notNull(),
  description: text("description").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commitResults = pgTable("commit_results", {
  id: text("id").primaryKey().notNull(),
  description: text("description"),
  status: text().$type<"pending" | "success" | "error">().default("pending"),
  type: text().$type<"feature" | "bugfix">(),
  owner: text().notNull(),
  repo: text().notNull(),
});

export const logCommitPair = pgTable("log_commit_pairs", {
  id: text("id").primaryKey().notNull(),
  commitResultId: text("commit_result_id")
    .notNull()
    .references(() => commitResults.id, { onDelete: "cascade" }),
  changelogId: text("changelog_id")
    .notNull()
    .references(() => changelog.id, { onDelete: "no action" }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});
