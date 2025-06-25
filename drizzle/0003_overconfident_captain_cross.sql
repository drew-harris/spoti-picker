CREATE UNIQUE INDEX `user_albums_id_unique` ON `user_albums` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_albums_user_id_album_id_unique` ON `user_albums` (`user_id`,`album_id`);