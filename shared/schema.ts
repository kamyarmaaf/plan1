import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  workStudy: text("work_study").notNull(),
  hobbies: text("hobbies").notNull(),
  sports: text("sports").notNull(),
  location: text("location").notNull(),
  weightKg: integer("weight_kg"),
  heightCm: integer("height_cm"),
  ageYears: integer("age_years"),
  reading: text("reading"),
  extraInformation: text("extra_information"),
  extraWords: text("extra_words"),
  aiContext: text("ai_context"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const dailyPlans = sqliteTable("daily_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  date: text("date").notNull(),
  timezone: text("timezone").notNull(),
  planJson: text("plan_json").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  userId: true,
  workStudy: true,
  hobbies: true,
  sports: true,
  location: true,
  weightKg: true,
  heightCm: true,
  ageYears: true,
  reading: true,
  extraInformation: true,
  extraWords: true,
  aiContext: true,
});

export const insertDailyPlanSchema = createInsertSchema(dailyPlans).pick({
  userId: true,
  date: true,
  timezone: true,
  planJson: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  name: true,
  email: true,
  subject: true,
  category: true,
  message: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type DailyPlan = typeof dailyPlans.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
