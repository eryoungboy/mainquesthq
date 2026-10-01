CREATE TYPE "public"."communication_status" AS ENUM('pending', 'sent', 'failed', 'skipped_no_whatsapp');--> statement-breakpoint
CREATE TYPE "public"."communication_type" AS ENUM('registration_email', 'whatsapp_confirmation', 'whatsapp_reminder', 'broadcast_email');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "communications_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"type" "communication_type" NOT NULL,
	"status" "communication_status" NOT NULL,
	"provider_id" varchar(255),
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_token" varchar(32) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_raw" varchar(50) NOT NULL,
	"phone_normalized" varchar(50) NOT NULL,
	"age_range" varchar(50) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"goal" text NOT NULL,
	"wants_updates" boolean DEFAULT false NOT NULL,
	"source" varchar(100),
	"consent" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_ticket_token_unique" UNIQUE("ticket_token"),
	CONSTRAINT "registrations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "communications_log" ADD CONSTRAINT "communications_log_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;