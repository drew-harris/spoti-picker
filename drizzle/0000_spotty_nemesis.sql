CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `albums_id_unique` ON `albums` (`id`);