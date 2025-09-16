import axios from 'axios';
import { type Profile } from "@shared/schema";
import { buildAIContext } from './buildAIContext';

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
  date, 
  timezone 
}: { 
  profile: Profile; 
  date: string; 
  timezone: string; 
}): Promise<DailyPlan> {
  // If no API key, return deterministic sample plan
  if (!process.env.DEEPSEEK_API_KEY) {
    return generateSamplePlan(date, timezone, profile);
  }

  try {
    const aiContext = buildAIContext(profile);
    
    const systemPrompt = `${aiContext}

You are a personal productivity AI that creates daily schedules. Generate a realistic daily plan as JSON only (no markdown, no code fences).

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
      "notes": "string (optional)"
    }
  ]
}

Guidelines:
- Create 8-12 realistic time blocks
- Include work/study based on their profile
- Add exercise based on their sports preferences
- Include meals, breaks, and sleep
- Add reading time if they have reading preferences
- Use realistic time slots (e.g., 08:00-09:00)
- Consider their location and typical daily patterns
- Make it practical and achievable`;

    const userPrompt = `Create a daily plan for ${date} in timezone ${timezone}. Consider the user's work/study situation, hobbies, and preferences. Make it realistic and balanced.`;

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
    return generateSamplePlan(date, timezone, profile);
  }
}

function generateSamplePlan(date: string, timezone: string, profile: Profile): DailyPlan {
  // Generate a deterministic sample plan based on profile and date
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

  // Customize based on profile
  if (profile.sports && profile.sports.toLowerCase().includes('yoga')) {
    baseItems[5] = { start: '17:00', end: '18:00', title: 'Yoga session', type: 'exercise', priority: 'medium' };
  }
  
  if (profile.reading && profile.reading.trim()) {
    baseItems[8] = { start: '20:00', end: '21:00', title: 'Reading time', type: 'reading', priority: 'medium' };
  }

  return {
    date,
    timezone,
    items: baseItems
  };
}
