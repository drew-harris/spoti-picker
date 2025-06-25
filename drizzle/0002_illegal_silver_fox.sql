CREATE TABLE `ingestion_status` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`total_albums` integer DEFAULT 0 NOT NULL,
	`processed_albums` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_albums` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`album_id` text NOT NULL,
	`added_at` integer NOT NULL,
	`spotify_added_at` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `albums` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `albums` ADD `url` text;--> statement-breakpoint
ALTER TABLE `albums` ADD `img` text;--> statement-breakpoint
ALTER TABLE `albums` ADD `artist` text;--> statement-breakpoint
ALTER TABLE `albums` ADD `release_date` text;--> statement-breakpoint
ALTER TABLE `albums` ADD `created_at` integer NOT NULL;