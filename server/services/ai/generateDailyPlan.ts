import axios from 'axios';
import { type Profile, type LongTermGoal } from "@shared/schema";
import { buildAIContext } from './buildAIContext';
import { storage } from "../../storage";

export type DailyPlanItem = {
  start: string;
  end: string;
  title: string;
  type: 'work' | 'study' | 'exercise' | 'meal' | 'reading' | 'break' | 'sleep' | 'other';
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
};

export type DailyPlan = {
  date: string;
  timezone: string;
  items: DailyPlanItem[];
};

export async function generateDailyPlan({ 
  profile, 
  userId,
  date, 
  timezone 
}: { 
  profile: Profile;
  userId: number;
  date: string; 
  timezone: string; 
}): Promise<DailyPlan> {
  // Fetch user's active long-term goals
  const longTermGoals = await storage.getLongTermGoals(userId);
  const activeGoals = longTermGoals.filter(goal => goal.status === 'active');

  // If no API key, return deterministic sample plan
  if (!process.env.DEEPSEEK_API_KEY) {
    return generateSamplePlan(date, timezone, profile, activeGoals);
  }

  try {
    const aiContext = buildAIContext(profile);
    
    // Build goals context for AI
    const goalsContext = activeGoals.length > 0 ? 
      `User's Active Long-term Goals:
${activeGoals.map(goal => 
  `- ${goal.title} (${goal.category}, Priority: ${goal.priority}, Progress: ${goal.progress}%, Target: ${goal.targetTimeframe})
    Description: ${goal.description}`
).join('\n')}

IMPORTANT: Daily schedule should include time blocks that support progress toward these long-term goals.` 
      : 'No active long-term goals set. Focus on general productivity and wellness.';
    
    const systemPrompt = `${aiContext}

${goalsContext}

You are a personal productivity AI that creates daily schedules aligned with long-term goals. Generate a realistic daily plan as JSON only (no markdown, no code fences).

Required JSON schema:
{
  "date": "YYYY-MM-DD",
  "timezone": "string",
  "items": [
    {
      "start": "HH:MM",
      "end": "HH:MM", 
      "title": "string",
      "type": "work|study|exercise|meal|reading|break|sleep|other",
      "priority": "low|medium|high",
      "notes": "string (should reference which goal this supports if applicable)"
    }
  ]
}

Guidelines:
- Create 8-12 realistic time blocks
- Include time blocks that directly support the user's active long-term goals
- Add work/study based on their profile and career goals
- Include exercise based on their sports preferences and fitness goals
- Add learning/reading time that aligns with learning goals
- Include meals, breaks, and sleep for wellbeing
- Use realistic time slots (e.g., 08:00-09:00)
- Consider their location and typical daily patterns
- Make it practical and achievable
- Prioritize goal-supporting activities as "high" priority`;

    const userPrompt = `Create a daily plan for ${date} in timezone ${timezone} that helps the user make progress toward their long-term goals. Consider their profile, active goals, and ensure the schedule is realistic and balanced.`;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-v3',
      temperature: 0.6,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('No content in DeepSeek response');
    }

    let content = response.data.choices[0].message.content;
    
    // Remove code fences if present
    if (content.includes('```')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const plan = JSON.parse(content) as DailyPlan;
    
    // Validate the plan structure
    if (!plan.date || !plan.timezone || !Array.isArray(plan.items)) {
      throw new Error('Invalid plan structure from AI');
    }

    return plan;

  } catch (error) {
    console.error('DeepSeek API error:', error);
    
    // Fallback to sample plan on API error
    return generateSamplePlan(date, timezone, profile, activeGoals);
  }
}

function generateSamplePlan(date: string, timezone: string, profile: Profile, activeGoals: LongTermGoal[] = []): DailyPlan {
  // Generate a deterministic sample plan based on profile and active goals
  const baseItems: DailyPlanItem[] = [
    { start: '07:00', end: '07:30', title: 'Morning routine', type: 'other', priority: 'medium' },
    { start: '07:30', end: '08:00', title: 'Breakfast', type: 'meal', priority: 'high' },
    { start: '08:00', end: '12:00', title: 'Work/Study time', type: 'work', priority: 'high' },
    { start: '12:00', end: '13:00', title: 'Lunch break', type: 'meal', priority: 'high' },
    { start: '13:00', end: '17:00', title: 'Work/Study time', type: 'work', priority: 'high' },
    { start: '17:00', end: '18:00', title: 'Exercise', type: 'exercise', priority: 'medium' },
    { start: '18:00', end: '19:00', title: 'Personal time', type: 'break', priority: 'low' },
    { start: '19:00', end: '20:00', title: 'Dinner', type: 'meal', priority: 'high' },
    { start: '20:00', end: '21:00', title: 'Reading/Hobbies', type: 'reading', priority: 'low' },
    { start: '21:00', end: '22:00', title: 'Wind down', type: 'break', priority: 'low' },
    { start: '22:00', end: '07:00', title: 'Sleep', type: 'sleep', priority: 'high' }
  ];

  // Customize based on active goals (priority order)
  if (activeGoals.length > 0) {
    const sortedGoals = activeGoals.sort((a, b) => b.priority - a.priority);
    
    // Replace time blocks with goal-aligned activities
    sortedGoals.slice(0, 3).forEach((goal, index) => {
      if (goal.category === 'fitness' && index < 1) {
        baseItems[5] = { 
          start: '17:00', 
          end: '18:00', 
          title: 'Goal-focused Exercise', 
          type: 'exercise', 
          priority: 'high',
          notes: `Working toward: ${goal.title}` 
        };
      } else if (goal.category === 'learning' && index < 2) {
        baseItems[8] = { 
          start: '20:00', 
          end: '21:00', 
          title: 'Learning Session', 
          type: 'reading', 
          priority: 'high',
          notes: `Study for: ${goal.title}` 
        };
      } else if (goal.category === 'career' && index < 2) {
        baseItems[2] = { 
          start: '08:00', 
          end: '12:00', 
          title: 'Career Development Work', 
          type: 'work', 
          priority: 'high',
          notes: `Progress on: ${goal.title}` 
        };
      } else if (goal.category === 'personal' && index < 3) {
        baseItems[6] = { 
          start: '18:00', 
          end: '19:00', 
          title: 'Personal Goal Time', 
          type: 'other', 
          priority: 'medium',
          notes: `Work on: ${goal.title}` 
        };
      } else if (goal.category === 'financial' && index < 3) {
        baseItems[4] = { 
          start: '13:00', 
          end: '17:00', 
          title: 'Financial Planning Work', 
          type: 'work', 
          priority: 'high',
          notes: `Progress on: ${goal.title}` 
        };
      }
    });
  } else {
    // Fallback to profile-based customization if no goals
    if (profile.sports && profile.sports.toLowerCase().includes('yoga')) {
      baseItems[5] = { start: '17:00', end: '18:00', title: 'Yoga session', type: 'exercise', priority: 'medium' };
    }
    
    if (profile.reading && profile.reading.trim()) {
      baseItems[8] = { start: '20:00', end: '21:00', title: 'Reading time', type: 'reading', priority: 'medium' };
    }
  }

  return {
    date,
    timezone,
    items: baseItems
  };
}
