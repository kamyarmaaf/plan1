import { Router } from "express";
import { storage } from "../storage"; // مسیر درست به DbStorage (بر اساس ساختار، شاید از server/lib/storage.ts)
import { authenticateToken } from "../middleware/auth"; // فرضاً در server/middleware/auth.ts
import { type AuthRequest } from "../auth"; // فرضاً در server/auth/index.ts
import { buildAIContext } from "../services/ai/buildAIContext"; // فرضاً در server/services/ai/buildAIContext.ts

// تعریف نوع‌های لازم (اگر در shared/schema داری، از اونجا ایمپورت کن و این بخش رو حذف کن)
type N8nResponse = Array<{
  data: Array<{
    output: string;
  }>;
}>;

interface ParsedGoals {
  fitnessGoals?: N8nGoalOutput[];
  learningGoals?: N8nGoalOutput[];
  careerGoals?: N8nGoalOutput[];
  personalGoals?: N8nGoalOutput[];
}

interface N8nGoalOutput {
  id: number;
  title: string;
  description: string;
  category: 'fitness' | 'learning' | 'career' | 'personal' | 'financial';
  priority: number;
  targetTimeframe: string;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'archived';
  aiContext?: string;
}

const router = Router();

const N8N_WEBHOOK_URL = "https://waxex65781.app.n8n.cloud/webhook-test/10c9fb43-e5ad-498d-aef3-6d7227d3c687";

// Generate long-term goals using n8n based on user profile
router.post("/generate", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getProfile(userId);

    if (!profile) {
      return res.status(400).json({ message: "Profile not found. Please complete your profile first." });
    }

    // Check if user already has goals to avoid duplicates
    const existingGoals = await storage.getLongTermGoals(userId);
    if (existingGoals.length > 0) {
      return res.status(409).json({ 
        message: "Long-term goals already exist for this user",
        goals: existingGoals 
      });
    }

    // Try n8n generation
    try {
      // Build payload from profile (با نام فیلدهای درست از schema: weightKg, heightCm, ageYears)
      const payload = {
        source: 'goals-generate',
        data: {
          workStudy: profile.workStudy,
          hobbies: profile.hobbies,
          sports: profile.sports,
          location: profile.location,
          reading: profile.reading || null,
          weight: profile.weightKg ?? null, // فیکس: weightKg به جای weight
          height: profile.heightCm ?? null, // فیکس: heightCm به جای height
          age: profile.ageYears ?? null, // فیکس: ageYears به جای age
          extraInformation: profile.extraInformation || null,
          extraWords: profile.extraWords || null,
          aiContext: buildAIContext(profile), // اگر نیاز نداری، حذف کن
        },
      };

      // Send to n8n webhook
      const n8nResponseRaw = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!n8nResponseRaw.ok) {
        throw new Error(`n8n request failed with status ${n8nResponseRaw.status}`);
      }

      const n8nResponse: N8nResponse = await n8nResponseRaw.json();

      // Upsert goals from n8n response
      const savedGoals = await storage.upsertLongTermGoalsFromN8n(userId, n8nResponse);

      res.json({
        message: "Long-term goals generated successfully",
        goals: savedGoals
      });

    } catch (error) {
      console.error('n8n API error:', error);
      return res.status(500).json({ message: 'Failed to generate goals from n8n' });
    }

  } catch (error) {
    console.error('Generate goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's long-term goals (بدون تغییر)
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const goals = await storage.getLongTermGoals(userId);
    
    res.json({
      message: "Goals retrieved successfully",
      goals
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update goal progress (بدون تغییر)
router.put("/:goalId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const goalId = parseInt(req.params.goalId);
    
    // Validate the update data
    const allowedUpdates = ['progress', 'status', 'priority'];
    const updates: any = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    // Verify ownership by checking if goal exists for this user
    const existingGoals = await storage.getLongTermGoals(userId);
    const goalExists = existingGoals.some(goal => goal.id === goalId);
    
    if (!goalExists) {
      return res.status(404).json({ message: 'Goal not found or access denied' });
    }

    const updatedGoal = await storage.updateLongTermGoal(goalId, updates);
    
    res.json({
      message: "Goal updated successfully",
      goal: updatedGoal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;