import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const communicationTypeEnum = pgEnum("communication_type", [
  "registration_email",
  "whatsapp_confirmation",
  "whatsapp_reminder",
  "broadcast_email",
]);

export const communicationStatusEnum = pgEnum("communication_status", [
  "pending",
  "sent",
  "failed",
  "skipped_no_whatsapp",
]);

export const registrations = pgTable("registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketToken: varchar("ticket_token", { length: 32 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneRaw: varchar("phone_raw", { length: 50 }).notNull(),
  phoneNormalized: varchar("phone_normalized", { length: 50 }).notNull(),
  ageRange: varchar("age_range", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  goal: text("goal").notNull(),
  wantsUpdates: boolean("wants_updates").notNull().default(false),
  source: varchar("source", { length: 100 }),
  consent: boolean("consent").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communicationsLog = pgTable("communications_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationId: uuid("registration_id").references(() => registrations.id).notNull(),
  type: communicationTypeEnum("type").notNull(),
  status: communicationStatusEnum("status").notNull(),
  providerId: varchar("provider_id", { length: 255 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: varchar("key", { length: 255 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
