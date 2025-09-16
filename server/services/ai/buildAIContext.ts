import { type Profile } from "@shared/schema";

export function buildAIContext(profile: Profile): string {
  const parts: string[] = [];
  
  // Basic info
  parts.push(`User Profile:`);
  parts.push(`- Work/Study: ${profile.workStudy}`);
  parts.push(`- Hobbies: ${profile.hobbies}`);
  parts.push(`- Sports/Exercise: ${profile.sports}`);
  parts.push(`- Location: ${profile.location}`);
  
  // Physical stats (if available)
  if (profile.ageYears) {
    parts.push(`- Age: ${profile.ageYears} years`);
  }
  if (profile.weightKg && profile.heightCm) {
    parts.push(`- Physical: ${profile.weightKg}kg, ${profile.heightCm}cm`);
  }
  
  // Reading preferences
  if (profile.reading && profile.reading.trim()) {
    parts.push(`- Reading: ${profile.reading}`);
  } else {
    parts.push(`- Reading: Open to AI recommendations based on interests`);
  }
  
  return parts.join('\n');
}
