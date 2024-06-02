CREATE TABLE `AuthMethod` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	`hash_method` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`totp_secret` text,
	`totp_expires` integer,
	`timeout_until` integer,
	`timeout_seconds` integer,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Car` (
	`id` text PRIMARY KEY NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`color` text NOT NULL,
	`price` real NOT NULL,
	`mileage` integer NOT NULL,
	`fuelType` text NOT NULL,
	`transmission` text NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_userKey_userId` ON `AuthMethod` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_session_userId` ON `Session` (`user_id`);