import { Router } from "express";
import { storage } from "../storage";
import { insertLongTermGoalSchema } from "@shared/schema";
import { authenticateToken } from "../middleware/auth";
import { type AuthRequest } from "../auth";
import { buildAIContext } from "../services/ai/buildAIContext";
import OpenAI from "openai";

const router = Router();

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// Initialize OpenAI client conditionally to avoid startup errors when API key is missing
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Generate long-term goals using AI based on user profile
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

    let generatedGoals = [];

    // Try AI generation first
    if (openai) {
      try {
        const aiContext = buildAIContext(profile);
        
        const systemPrompt = `You are a personal life planning AI that creates meaningful long-term goals.

${aiContext}

Generate 4-6 realistic long-term goals based on the user's profile as JSON only (no markdown, no code fences).

Required JSON schema:
{
  "goals": [
    {
      "title": "string (concise goal title)",
      "description": "string (detailed description with actionable steps)",
      "category": "fitness|learning|career|personal|financial",
      "priority": "number (1-5, where 5 is highest priority)",
      "targetTimeframe": "string (6 months|1 year|2 years|3 years|5 years)",
      "aiContext": "string (brief explanation of why this goal was suggested)"
    }
  ]
}

Guidelines:
- Create goals that align with their work/study, hobbies, and sports interests
- Include fitness goals based on their sports preferences
- Add learning goals related to their hobbies or career development
- Include career advancement goals based on their work/study situation
- Consider personal development goals
- Make goals specific, measurable, and realistic
- Vary the timeframes (mix of short-term and long-term goals)
- Set appropriate priorities based on their profile
- Ensure goals are actionable and meaningful`;

        const userPrompt = `Create personalized long-term goals for this user. Consider their complete profile and create goals that will help them grow in all areas of life over the next few years.`;

        const response = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1500,
        });

        if (!response.choices?.[0]?.message?.content) {
          throw new Error('No content in OpenAI response');
        }

        const result = JSON.parse(response.choices[0].message.content);
        
        if (!result.goals || !Array.isArray(result.goals)) {
          throw new Error('Invalid goals structure from AI');
        }

        generatedGoals = result.goals;

      } catch (error) {
        console.error('OpenAI API error:', error);
        // Fall back to template goals if AI fails
        generatedGoals = generateTemplateGoals(profile);
      }
    } else {
      // No AI key available, use template goals
      generatedGoals = generateTemplateGoals(profile);
    }

    // Save generated goals to database
    const savedGoals = [];
    for (const goalData of generatedGoals) {
      const goal = await storage.createLongTermGoal({
        userId,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        priority: goalData.priority || 3,
        targetTimeframe: goalData.targetTimeframe,
        progress: 0,
        status: "active",
        aiContext: goalData.aiContext || "Generated based on user profile"
      });
      savedGoals.push(goal);
    }

    res.json({
      message: "Long-term goals generated successfully",
      goals: savedGoals
    });

  } catch (error) {
    console.error('Generate goals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's long-term goals
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

// Update goal progress
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

// Template goals generator for fallback
function generateTemplateGoals(profile: any) {
  const goals = [];
  
  // Career/Study goal based on work/study field
  goals.push({
    title: `Advance in ${profile.workStudy}`,
    description: `Develop expertise and advance career/studies in ${profile.workStudy} through skill development, networking, and achieving key milestones.`,
    category: "career",
    priority: 5,
    targetTimeframe: "2 years",
    aiContext: "Generated based on user's work/study focus"
  });

  // Fitness goal based on sports interests
  if (profile.sports && profile.sports.trim()) {
    goals.push({
      title: `Improve ${profile.sports} Performance`,
      description: `Enhance skills and physical conditioning in ${profile.sports}, set performance targets, and maintain consistent training schedule.`,
      category: "fitness",
      priority: 4,
      targetTimeframe: "1 year",
      aiContext: "Generated based on user's sports interests"
    });
  }

  // Learning goal based on hobbies
  if (profile.hobbies && profile.hobbies.trim()) {
    goals.push({
      title: `Master ${profile.hobbies}`,
      description: `Deepen knowledge and skills in ${profile.hobbies}, potentially exploring advanced techniques or teaching others.`,
      category: "learning",
      priority: 3,
      targetTimeframe: "1 year",
      aiContext: "Generated based on user's hobby interests"
    });
  }

  // Health and wellness goal
  if (profile.ageYears || profile.weightKg || profile.heightCm) {
    goals.push({
      title: "Optimize Health and Wellness",
      description: "Maintain optimal physical and mental health through regular exercise, proper nutrition, and stress management.",
      category: "fitness",
      priority: 4,
      targetTimeframe: "6 months",
      aiContext: "Generated for overall health optimization"
    });
  }

  // Financial goal
  goals.push({
    title: "Build Financial Security",
    description: "Establish emergency savings, create investment portfolio, and develop multiple income streams for long-term financial stability.",
    category: "financial",
    priority: 4,
    targetTimeframe: "3 years",
    aiContext: "Generated for financial stability and growth"
  });

  // Personal development goal
  goals.push({
    title: "Develop Leadership Skills",
    description: "Build communication, decision-making, and team leadership abilities through practice, feedback, and continuous learning.",
    category: "personal",
    priority: 3,
    targetTimeframe: "2 years",
    aiContext: "Generated for personal growth and development"
  });

  return goals.slice(0, 5); // Return max 5 goals
}

export default router;