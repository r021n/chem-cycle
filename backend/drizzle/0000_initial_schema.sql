CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text,
	`order_index` integer DEFAULT 1 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`content_json` text NOT NULL,
	`attachments_json` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `activities_slug_unique` ON `activities` (`slug`);--> statement-breakpoint
CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text DEFAULT 'Administrator' NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`avatar_url` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_title` text NOT NULL,
	`author` text DEFAULT 'Admin' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `material_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`material_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`body` text NOT NULL,
	`ip_hash` text NOT NULL,
	`is_approved` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`summary` text,
	`cover_url` text,
	`order_index` integer DEFAULT 1 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`content_json` text NOT NULL,
	`category` text,
	`learning_objectives_json` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materials_slug_unique` ON `materials` (`slug`);--> statement-breakpoint
CREATE TABLE `media_blobs` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`data` blob NOT NULL,
	`uploaded_by` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`order_index` integer DEFAULT 1 NOT NULL,
	`question_text` text NOT NULL,
	`stimulus_image` text,
	`sections_json` text DEFAULT '[]' NOT NULL,
	`choices_json` text DEFAULT '[]' NOT NULL,
	`correct_answer_ids_json` text DEFAULT '[]' NOT NULL,
	`explanation` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`description` text,
	`duration_minutes` integer DEFAULT 15 NOT NULL,
	`difficulty` text DEFAULT 'Menengah' NOT NULL,
	`order_index` integer DEFAULT 1 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
