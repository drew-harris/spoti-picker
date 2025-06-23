import { sqliteTable } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";

export const albums = sqliteTable("albums", {
  id: t.text().primaryKey().unique(),
});
