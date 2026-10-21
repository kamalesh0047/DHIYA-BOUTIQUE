CREATE TABLE `demo_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`items` text NOT NULL,
	`total` integer NOT NULL,
	`created_at` text NOT NULL,
	`method` text NOT NULL
);
