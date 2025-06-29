import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { user } from "../../auth.sql";

export const albums = sqliteTable("albums", {
  id: text().primaryKey().unique(),
  name: text("name").notNull(),
  url: text("url"),
  img: text("img"),
  artist: text("artist"),
  releaseDate: text("release_date"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userAlbums = sqliteTable(
  "user_albums",
  {
    id: text("id").primaryKey().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    addedAt: integer("added_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    spotifyAddedAt: text("spotify_added_at"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [unique().on(t.userId, t.albumId)],
);
