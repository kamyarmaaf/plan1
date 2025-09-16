import { Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth";
import { storage } from "../storage";
import { dailyPlans } from "@shared/schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";

const router = Router();

router.post("/daily-tasks", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
    }

    const apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      // Deterministic fallback if key missing
      return res.json({
        daily_tasks: [
          { id: "1", title: "Morning Workout", time: "07:00", type: "workout", completed: false, description: "20min jog + stretching" },
          { id: "2", title: "Healthy Breakfast", time: "08:00", type: "meal", completed: false, description: "Oatmeal with berries" },
          { id: "3", title: "Deep Work", time: "09:00", type: "work", completed: false, description: "Focus block on priority task" },
        ],
      });
    }

    const prompt = `You are an intelligent health and productivity planner.  
Based on user inputs (height, weight, age, goals, interests), generate a structured multi-layer plan:

1. Roadmap (long-term: 3+ months) with monthly milestones.  
2. Monthly Planner (weekly breakdowns for habit/skill focus).  
3. Daily Planner (JSON list of daily tasks).  

Each task in the Daily Planner must include:  
id, title, time, type (workout, meal, reading, work, rest), description, and completed: false.  

Return only JSON in this format:
{
  "roadmap": { ... },
  "monthly_plans": { ... },
  "daily_tasks": [
    {
      "id": "1",
      "title": "Morning Workout",
      "time": "07:00",
      "type": "workout",
      "completed": false,
      "description": "30min cardio + stretching"
    }
  ]
}`;

    const userContext = {
      heightCm: profile.heightCm ?? null,
      weightKg: profile.weightKg ?? null,
      ageYears: profile.ageYears ?? null,
      interests: profile.hobbies,
      sports: profile.sports,
      goals: profile.workStudy,
      location: profile.location,
      reading: profile.reading ?? "",
    };

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `[INST] Return ONLY valid JSON (no markdown, no prose). Use this instruction and user context to produce the response. ${prompt}\n\nUser context: ${JSON.stringify(userContext)} [/INST]`,
        parameters: { max_new_tokens: 1200, temperature: 0.6 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ message: `DeepSeek error ${response.status}: ${text}` });
    }

    const data = await response.json();
    let content: string = Array.isArray(data) ? (data[0]?.generated_text ?? "") : (data?.generated_text ?? "");
    if (!content) {
      return res.status(502).json({ message: "Empty response from DeepSeek" });
    }

    if (content.includes("```")) {
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(content);

    // Normalize times: keep AI-provided times; fill missing ones evenly across 24h
    const rawList: any[] = Array.isArray(parsed?.daily_tasks) ? parsed.daily_tasks : [];
    const total = rawList.length || 0;
    const step = total > 0 ? Math.floor((24 * 60) / total) : 0;
    const used: Set<string> = new Set();

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const toStr = (mins: number) => `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`;

    // Record already provided times (valid HH:MM)
    rawList.forEach((t) => {
      const time: string | undefined = t?.time && String(t.time);
      if (time && /^\d{2}:\d{2}$/.test(time)) used.add(time);
    });

    // Assign missing times deterministically over 24h
    let idx = 0;
    const normalizedList = rawList.map((t, i) => {
      let time: string | undefined = t?.time && String(t.time);
      if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        let candidate = step > 0 ? (i * step) % (24 * 60) : 0;
        let candidateStr = toStr(candidate);
        // Avoid duplicates
        let guard = 0;
        while (used.has(candidateStr) && guard < 1440) {
          candidate = (candidate + 1) % (24 * 60);
          candidateStr = toStr(candidate);
          guard++;
        }
        time = candidateStr;
        used.add(time);
      }
      return { ...t, time };
    });

    // Persist to daily_plans for today
    const date = new Date().toISOString().slice(0, 10);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const planJson = JSON.stringify({ daily_tasks: normalizedList });

    await storage.upsertDailyPlan({
      userId,
      date,
      timezone,
      planJson,
    });

    return res.json({ daily_tasks: normalizedList , date, timezone});
  } catch (err: any) {
    console.error("/api/ai/daily-tasks error", err);
    return res.status(500).json({ message: "Failed to generate tasks" });
  }
});

// Toggle completion for a task and persist back into daily_plans JSON
router.post("/daily-tasks/toggle", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { date, id, completed } = req.body as { date: string; id: string; completed: boolean };

    if (!date || !id || typeof completed !== "boolean") {
      return res.status(400).json({ message: "date, id and completed are required" });
    }

    const existing = await storage.getDailyPlan(userId, date);
    if (!existing) {
      return res.status(404).json({ message: "Plan not found for this date" });
    }

    let json: any = {};
    try { json = JSON.parse(existing.planJson); } catch {}

    const list: any[] = Array.isArray(json.daily_tasks) ? json.daily_tasks : [];
    const idx = list.findIndex(t => String(t.id) === String(id));
    if (idx >= 0) {
      list[idx].completed = completed;
    }

    const newJson = JSON.stringify({ ...json, daily_tasks: list });

    await db.update(dailyPlans)
      .set({ planJson: newJson })
      .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, date)));

    return res.json({ message: "Task updated", daily_tasks: list });
  } catch (err) {
    console.error("/api/ai/daily-tasks/toggle error", err);
    return res.status(500).json({ message: "Failed to update task" });
  }
});

export default router;


