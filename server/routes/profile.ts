import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticateToken } from '../middleware/auth';
import { type AuthRequest } from '../auth';
import { buildAIContext } from '../services/ai/buildAIContext';

const router = Router();

// Validation schemas
const profileSchema = z.object({
  workStudy: z.string().min(1, 'Work/study is required'),
  hobbies: z.string().min(1, 'Hobbies are required'),
  sports: z.string().min(1, 'Sports are required'),
  location: z.string().min(1, 'Location is required'),
  weight: z.number().min(0).nullable().optional(),
  height: z.number().min(0).nullable().optional(),
  age: z.number().min(0).nullable().optional(),
  reading: z.string().nullable().optional(),
  extraInformation: z.string().nullable().optional(),
  extraWords: z.string().nullable().optional(),
});

// GET /api/profile/me - Get current user's profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const profile = await storage.getProfile(req.user!.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      message: 'Profile retrieved successfully',
      profile: {
        id: profile.id,
        userId: profile.userId,
        workStudy: profile.workStudy,
        hobbies: profile.hobbies,
        sports: profile.sports,
        location: profile.location,
        weight: profile.weightKg,
        height: profile.heightCm,
        age: profile.ageYears,
        reading: profile.reading,
        extraInformation: profile.extraInformation,
        extraWords: profile.extraWords,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/profile - Create or update profile
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validation = profileSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }

    const { workStudy, hobbies, sports, location, weight, height, age, reading, extraInformation, extraWords } = validation.data;

    // Create/update profile
    const profile = await storage.upsertProfile({
      userId: req.user!.id,
      workStudy,
      hobbies,
      sports,
      location,
      weightKg: weight,
      heightCm: height,
      ageYears: age,
      reading,
      extraInformation,
      extraWords
    });

    // Build AI context and update profile
    const aiContext = buildAIContext(profile);
    const updatedProfile = await storage.upsertProfile({
      ...profile,
      aiContext
    });

    res.json({
      message: 'Profile saved successfully',
      profile: {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        workStudy: updatedProfile.workStudy,
        hobbies: updatedProfile.hobbies,
        sports: updatedProfile.sports,
        location: updatedProfile.location,
        weight: updatedProfile.weightKg,
        height: updatedProfile.heightCm,
        age: updatedProfile.ageYears,
        reading: updatedProfile.reading,
        extraInformation: updatedProfile.extraInformation,
        extraWords: updatedProfile.extraWords,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
