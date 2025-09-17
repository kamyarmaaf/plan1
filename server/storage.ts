import { 
  type User, type InsertUser, type Profile, type InsertProfile, 
  type DailyPlan, type InsertDailyPlan, type Message, type InsertMessage, 
  type LongTermGoal, type InsertLongTermGoal, 
  users, profiles, dailyPlans, messages, longTermGoals 
} from "@shared/schema";
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

export interface N8nGoalOutput {
  id: number; // یا string بسته به ساختار n8n
  title: string;
  description: string;
  category: 'fitness' | 'learning' | 'career' | 'personal' | 'financial';
  priority: number;
  targetTimeframe: string;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'archived';
  aiContext?: string;
}

// تعریف به‌روز شده با type alias برای جلوگیری از خطای آرایه
type N8nResponse = Array<{
  data: Array<{
    output: string;
  }>;
}>;

// نوع برای JSON parse شده داخل output
interface ParsedGoals {
  fitnessGoals?: N8nGoalOutput[];
  learningGoals?: N8nGoalOutput[];
  careerGoals?: N8nGoalOutput[];
  personalGoals?: N8nGoalOutput[];
  // اگر دسته‌بندی‌های دیگه‌ای اضافه بشه، اینجا اضافه کن
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertLongTermGoalsFromN8n(userId: number, n8nResponse: N8nResponse): Promise<LongTermGoal[]> {
    const results: LongTermGoal[] = [];

    // چک ایمنی: مطمئن شو n8nResponse آرایه است
    if (!Array.isArray(n8nResponse)) {
      throw new Error('n8nResponse must be an array');
    }

    // استخراج output از response (فرض می‌کنیم فقط یکی هست، اما لوپ می‌زنیم برای ایمنی)
    let rawOutput = '';
    for (const item of n8nResponse) {
      if (!Array.isArray(item.data)) {
        continue; // اگر data آرایه نباشه، رد شو
      }
      for (const dataItem of item.data) {
        rawOutput = dataItem.output;
        break; // معمولاً یکی کافیه، اما اگر چندتا باشه می‌تونی لوپ کنی
      }
      if (rawOutput) break;
    }

    if (!rawOutput) {
      throw new Error('No output found in n8n response');
    }

    // حذف markdown (```json و ```) با regex
    const jsonString = rawOutput
      .replace(/```json\n?/, '') // حذف شروع markdown
      .replace(/\n?```/, '') // حذف پایان markdown
      .trim();

    // parse به JSON
    let parsedGoals: ParsedGoals;
    try {
      parsedGoals = JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Failed to parse n8n output JSON: ' + (error as Error).message);
    }

    // جمع‌آوری همه goals از دسته‌بندی‌ها به یک آرایه
    const allGoals: N8nGoalOutput[] = [
      ...(parsedGoals.fitnessGoals || []),
      ...(parsedGoals.learningGoals || []),
      ...(parsedGoals.careerGoals || []),
      ...(parsedGoals.personalGoals || []),
      // اگر دسته‌بندی دیگه‌ای اضافه بشه، اینجا اضافه کن
    ];

    // حالا upsert هر هدف
    for (const goal of allGoals) {
      const existingGoal = await db.select().from(longTermGoals)
        .where(and(eq(longTermGoals.userId, userId), eq(longTermGoals.id, goal.id)))
        .limit(1);
      
      if (existingGoal[0]) {
        const updated = await db.update(longTermGoals)
          .set({
            ...goal,
            userId, // مطمئن شو userId درست باشه
            updatedAt: new Date(),
          })
          .where(eq(longTermGoals.id, goal.id))
          .returning();
        results.push(updated[0]);
      } else {
        const created = await db.insert(longTermGoals)
          .values({
            ...goal,
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        results.push(created[0]);
      }
    }

    return results;
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
    const existing = await this.getProfile(profile.userId);
    if (existing) {
      const result = await db.update(profiles)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(profiles.userId, profile.userId))
        .returning();
      return result[0];
    } else {
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
    const existing = await this.getDailyPlan(plan.userId, plan.date);
    if (existing) {
      const result = await db.update(dailyPlans)
        .set({ ...plan, updatedAt: new Date() })
        .where(and(eq(dailyPlans.userId, plan.userId), eq(dailyPlans.date, plan.date)))
        .returning();
      return result[0];
    } else {
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
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(longTermGoals.id, goalId))
      .returning();
    return result[0];
  }

  async deleteLongTermGoal(goalId: number): Promise<void> {
    await db.delete(longTermGoals).where(eq(longTermGoals.id, goalId));
  }
}

export const storage = new DbStorage();