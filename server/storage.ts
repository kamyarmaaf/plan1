import { type User, type InsertUser, type Profile, type InsertProfile, type DailyPlan, type InsertDailyPlan, type Message, type InsertMessage, type LongTermGoal, type InsertLongTermGoal, users, profiles, dailyPlans, messages, longTermGoals } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProfile(userId: number): Promise<Profile | undefined>;
  upsertProfile(profile: InsertProfile): Promise<Profile>;
  getDailyPlan(userId: number, date: string): Promise<DailyPlan | undefined>;
  upsertDailyPlan(plan: InsertDailyPlan): Promise<DailyPlan>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  getLongTermGoals(userId: number): Promise<LongTermGoal[]>;
  createLongTermGoal(goal: InsertLongTermGoal): Promise<LongTermGoal>;
  updateLongTermGoal(goalId: number, updates: Partial<InsertLongTermGoal>): Promise<LongTermGoal>;
  deleteLongTermGoal(goalId: number): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getProfile(userId: number): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return result[0];
  }

  async upsertProfile(profile: InsertProfile): Promise<Profile> {
    // Check if profile exists
    const existing = await this.getProfile(profile.userId);
    
    if (existing) {
      // Update existing profile
      const result = await db.update(profiles)
        .set({
          ...profile,
          updatedAt: new Date()
        })
        .where(eq(profiles.userId, profile.userId))
        .returning();
      return result[0];
    } else {
      // Create new profile
      const result = await db.insert(profiles).values(profile).returning();
      return result[0];
    }
  }

  async getDailyPlan(userId: number, date: string): Promise<DailyPlan | undefined> {
    const result = await db.select().from(dailyPlans)
      .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, date)))
      .limit(1);
    return result[0];
  }

  async upsertDailyPlan(plan: InsertDailyPlan): Promise<DailyPlan> {
    // Check if plan exists
    const existing = await this.getDailyPlan(plan.userId, plan.date);
    
    if (existing) {
      // Update existing plan
      const result = await db.update(dailyPlans)
        .set({
          ...plan,
          updatedAt: new Date()
        })
        .where(and(eq(dailyPlans.userId, plan.userId), eq(dailyPlans.date, plan.date)))
        .returning();
      return result[0];
    } else {
      // Create new plan
      const result = await db.insert(dailyPlans).values(plan).returning();
      return result[0];
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getAllMessages(): Promise<Message[]> {
    const result = await db.select().from(messages).orderBy(messages.createdAt);
    return result;
  }

  async getLongTermGoals(userId: number): Promise<LongTermGoal[]> {
    const result = await db.select().from(longTermGoals)
      .where(eq(longTermGoals.userId, userId))
      .orderBy(longTermGoals.priority, longTermGoals.createdAt);
    return result;
  }

  async createLongTermGoal(goal: InsertLongTermGoal): Promise<LongTermGoal> {
    const result = await db.insert(longTermGoals).values(goal).returning();
    return result[0];
  }

  async updateLongTermGoal(goalId: number, updates: Partial<InsertLongTermGoal>): Promise<LongTermGoal> {
    const result = await db.update(longTermGoals)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(longTermGoals.id, goalId))
      .returning();
    return result[0];
  }

  async deleteLongTermGoal(goalId: number): Promise<void> {
    await db.delete(longTermGoals).where(eq(longTermGoals.id, goalId));
  }
}

export const storage = new DbStorage();
