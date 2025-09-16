import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { type AuthRequest } from "../auth";
import { storage } from "../storage";
import { dailyPlans } from "@shared/schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schema for AI monthly planning response
const monthlyPlanSchema = z.object({
  ai_vision: z.object({
    six_month_projection: z.string(),
    one_year_vision: z.string()
  }),
  monthly_goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    category: z.enum(['fitness', 'learning', 'career', 'personal']),
    progress: z.number().min(0).max(100),
    target: z.string()
  })),
  milestones: z.array(z.object({
    id: z.string(),
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    completed: z.boolean(),
    description: z.string()
  }))
});

router.post("/daily-tasks", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
    }

    // Fetch user's active long-term goals
    const longTermGoals = await storage.getLongTermGoals(userId);
    const activeGoals = longTermGoals.filter(goal => goal.status === 'active');

    const apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      // Enhanced deterministic fallback that considers active goals
      const goalBasedTasks: Array<{
        id: string;
        title: string;
        time: string;
        type: string;
        completed: boolean;
        description: string;
      }> = [];
      if (activeGoals.length > 0) {
        // Generate goal-aligned tasks
        activeGoals.slice(0, 2).forEach((goal, index) => {
          if (goal.category === 'fitness') {
            goalBasedTasks.push({
              id: `goal-${index + 1}`,
              title: "Goal-aligned Workout",
              time: "07:00",
              type: "workout",
              completed: false,
              description: `Work towards: ${goal.title}`
            });
          } else if (goal.category === 'learning') {
            goalBasedTasks.push({
              id: `goal-${index + 1}`,
              title: "Learning Session",
              time: "19:00",
              type: "reading",
              completed: false,
              description: `Study for: ${goal.title}`
            });
          } else if (goal.category === 'career') {
            goalBasedTasks.push({
              id: `goal-${index + 1}`,
              title: "Career Development",
              time: "09:00",
              type: "work",
              completed: false,
              description: `Progress on: ${goal.title}`
            });
          } else {
            goalBasedTasks.push({
              id: `goal-${index + 1}`,
              title: "Personal Goal Work",
              time: "18:00",
              type: "work",
              completed: false,
              description: `Work on: ${goal.title}`
            });
          }
        });
      }
      
      const defaultTasks = [
        { id: "default-1", title: "Morning Routine", time: "08:00", type: "meal", completed: false, description: "Healthy breakfast and planning" },
        { id: "default-2", title: "Focus Block", time: "10:00", type: "work", completed: false, description: "Deep work session" },
      ];
      
      return res.json({
        daily_tasks: [...goalBasedTasks, ...defaultTasks].slice(0, 5),
      });
    }

    // Build goals context for AI
    const goalsContext = activeGoals.length > 0 ? 
      `User's Active Long-term Goals:
${activeGoals.map(goal => 
  `- ${goal.title} (${goal.category}, Priority: ${goal.priority}, Progress: ${goal.progress}%, Target: ${goal.targetTimeframe})
    Description: ${goal.description}`
).join('\n')}

IMPORTANT: Daily tasks should directly support progress toward these long-term goals.` 
      : 'No active long-term goals set. Focus on general productivity and wellness.';

    const prompt = `You are an intelligent daily task planner that creates tasks aligned with long-term goals.

${goalsContext}

User Profile:
- Work/Study: ${profile.workStudy}
- Hobbies: ${profile.hobbies}
- Sports: ${profile.sports}
- Location: ${profile.location}
${profile.ageYears ? `- Age: ${profile.ageYears} years` : ''}
${profile.weightKg && profile.heightCm ? `- Physical: ${profile.weightKg}kg, ${profile.heightCm}cm` : ''}
${profile.reading ? `- Reading: ${profile.reading}` : ''}

Generate 4-6 daily tasks that:
1. Support progress toward the user's active long-term goals
2. Are realistic and achievable in one day
3. Include variety (work, exercise, learning, personal care)
4. Are time-specific and actionable

Each task must include: id, title, time, type (workout, meal, reading, work, rest), description, and completed: false.

Return ONLY JSON in this format:
{
  "daily_tasks": [
    {
      "id": "1",
      "title": "Goal-aligned task title",
      "time": "07:00",
      "type": "workout",
      "completed": false,
      "description": "Specific action that supports [Goal Name]"
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
      activeGoals: activeGoals.map(goal => ({
        title: goal.title,
        category: goal.category,
        priority: goal.priority,
        progress: goal.progress,
        targetTimeframe: goal.targetTimeframe,
        description: goal.description
      }))
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

// Generate AI-powered monthly goals and milestones
router.post("/monthly-planning", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
    }

    // Try DeepSeek first, then Hugging Face, then fallback
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;
    const hfKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;

    const currentDate = new Date();
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let monthlyData = null;

    // Try DeepSeek first
    if (deepSeekKey) {
      try {
        const systemPrompt = `You are a personal productivity AI that creates monthly goals and planning.

User Profile:
- Work/Study: ${profile.workStudy}
- Hobbies: ${profile.hobbies}
- Sports/Exercise: ${profile.sports}
- Location: ${profile.location}
${profile.ageYears ? `- Age: ${profile.ageYears} years` : ''}
${profile.weightKg && profile.heightCm ? `- Physical: ${profile.weightKg}kg, ${profile.heightCm}cm` : ''}
${profile.reading ? `- Reading: ${profile.reading}` : ''}

Generate realistic monthly goals and milestones as JSON only (no markdown, no code fences).

Required JSON schema:
{
  "ai_vision": {
    "six_month_projection": "string",
    "one_year_vision": "string"
  },
  "monthly_goals": [
    {
      "id": "string",
      "title": "string",
      "category": "fitness|learning|career|personal",
      "progress": number,
      "target": "string"
    }
  ],
  "milestones": [
    {
      "id": "string", 
      "title": "string",
      "date": "YYYY-MM-DD",
      "completed": boolean,
      "description": "string"
    }
  ]
}

Guidelines:
- Create 3-5 monthly goals based on their profile
- Include fitness goals if they have sports interests
- Add learning goals based on their hobbies/reading
- Include career goals based on their work/study
- Create 4-6 milestones spread throughout the month
- Make goals realistic and achievable
- Consider their location and lifestyle`;

        const userPrompt = `Create a monthly plan for ${monthYear}. Consider the user's profile and create personalized, achievable goals with progress tracking and meaningful milestones.`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepSeekKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-v3',
            temperature: 0.6,
            max_tokens: 1500,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.choices?.[0]?.message?.content || "";
          
          if (content.includes("```")) {
            content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
          }
          
          const parsed = JSON.parse(content);
          const validated = monthlyPlanSchema.safeParse(parsed);
          if (validated.success) {
            monthlyData = validated.data;
          } else {
            console.error('DeepSeek response validation failed:', validated.error);
          }
        }
      } catch (deepSeekError) {
        console.error('DeepSeek API error:', deepSeekError);
        // Continue to Hugging Face fallback
      }
    }

    // Try Hugging Face if DeepSeek failed
    if (!monthlyData && hfKey) {
      try {
        const prompt = `You are an intelligent productivity planner. Based on user profile, generate monthly goals and milestones.

Return only JSON in this format:
{
  "ai_vision": {
    "six_month_projection": "At your current pace, you'll achieve...",
    "one_year_vision": "By maintaining these habits, you'll..."
  },
  "monthly_goals": [
    {
      "id": "1",
      "title": "Goal title", 
      "category": "fitness|learning|career|personal",
      "progress": 0,
      "target": "Target description"
    }
  ],
  "milestones": [
    {
      "id": "1",
      "title": "Milestone title",
      "date": "2024-01-15", 
      "completed": false,
      "description": "Description"
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
            Authorization: `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `[INST] Return ONLY valid JSON (no markdown, no prose). Use this instruction and user context to produce the response. ${prompt}\n\nUser context: ${JSON.stringify(userContext)} [/INST]`,
            parameters: { max_new_tokens: 1500, temperature: 0.6 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let content = Array.isArray(data) ? (data[0]?.generated_text ?? "") : (data?.generated_text ?? "");
          
          if (content.includes("```")) {
            content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
          }
          
          const parsed = JSON.parse(content);
          const validated = monthlyPlanSchema.safeParse(parsed);
          if (validated.success) {
            monthlyData = validated.data;
          } else {
            console.error('Hugging Face response validation failed:', validated.error);
          }
        }
      } catch (hfError) {
        console.error('Hugging Face API error:', hfError);
        // Continue to fallback
      }
    }

    // Fallback if both APIs failed
    if (!monthlyData) {
      monthlyData = {
        ai_vision: {
          six_month_projection: "Based on your profile, focusing on consistent daily habits will help you achieve significant progress in your fitness, learning, and career goals. Building momentum in small, manageable steps leads to remarkable long-term results.",
          one_year_vision: "By maintaining consistent effort in your areas of interest, you'll develop expertise and achieve meaningful milestones that align with your personal and professional aspirations."
        },
        monthly_goals: [
          { id: '1', title: 'Daily Exercise Routine', category: 'fitness', progress: 0, target: '30 days of activity' },
          { id: '2', title: 'Learn New Skills', category: 'learning', progress: 0, target: 'Complete 2 courses' },
          { id: '3', title: 'Career Development', category: 'career', progress: 0, target: 'Advance key projects' },
          { id: '4', title: 'Personal Growth', category: 'personal', progress: 0, target: 'Develop healthy habits' },
        ],
        milestones: [
          { id: '1', title: 'Complete first week of habits', date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-07`, completed: false, description: 'Build foundation for monthly goals' },
          { id: '2', title: 'Mid-month check-in', date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-15`, completed: false, description: 'Assess progress and adjust approach' },
          { id: '3', title: 'Complete major milestone', date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-23`, completed: false, description: 'Achieve significant goal progress' },
          { id: '4', title: 'Month-end reflection', date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-30`, completed: false, description: 'Review achievements and plan next month' },
        ]
      };
    }

    // Save monthly plan to database using the comprehensive plan structure
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await storage.upsertDailyPlan({
      userId,
      date: `monthly-${currentYear}-${currentMonth}`,
      timezone,
      planJson: JSON.stringify(monthlyData)
    });

    return res.json({
      message: 'Monthly planning data generated successfully',
      data: monthlyData,
      month: monthYear
    });

  } catch (err: any) {
    console.error("/api/ai/monthly-planning error", err);
    return res.status(500).json({ message: "Failed to generate monthly planning data" });
  }
});

export default router;


