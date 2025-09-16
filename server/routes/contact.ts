import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertMessageSchema } from '@shared/schema';

const router = Router();

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  message: z.string().min(1, 'Message is required'),
});

// POST /api/contact - Create a new contact message
router.post('/', async (req, res) => {
  try {
    const validation = contactSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        errors: validation.error.errors 
      });
    }

    const { name, email, subject, category, message } = validation.data;

    // Create message
    const newMessage = await storage.createMessage({
      name,
      email,
      subject,
      category,
      message
    });

    res.status(201).json({
      message: 'Contact message sent successfully',
      data: {
        id: newMessage.id,
        name: newMessage.name,
        email: newMessage.email,
        subject: newMessage.subject,
        category: newMessage.category,
        message: newMessage.message,
        createdAt: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/contact - Get all contact messages
router.get('/', async (req, res) => {
  try {
    const messages = await storage.getAllMessages();

    res.json({
      message: 'Messages retrieved successfully',
      data: messages.map(msg => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        category: msg.category,
        message: msg.message,
        createdAt: msg.createdAt
      }))
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
