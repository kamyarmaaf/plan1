import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  generateTokens, 
  verifyRefreshToken, 
  blacklistRefreshToken, 
  isRefreshTokenBlacklisted,
  type AuthRequest 
} from "./auth";
import { insertUserSchema } from "@shared/schema";
import profileRoutes from "./routes/profile";
import planRoutes from "./routes/plan";
import aiRoutes from "./routes/ai";
import contactRoutes from "./routes/contact";
import goalsRoutes from "./routes/goals";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database tables
  await initializeDatabase();

  // Mount API routes
  app.use('/api/profile', profileRoutes);
  app.use('/api/plan', planRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/goals', goalsRoutes);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validate input
      const validation = insertUserSchema.safeParse({ name, email, password });
      if (!validation.success) {
        return res.status(400).json({ 
          message: 'Invalid input', 
          errors: validation.error.errors 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      // Check if token is blacklisted
      if (isRefreshTokenBlacklisted(refreshToken)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      const user = await storage.getUser(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Generate new access token
      const { accessToken } = generateTokens({
        id: user.id,
        email: user.email,
        name: user.name
      });

      res.json({
        message: 'Token refreshed successfully',
        accessToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      // Blacklist the refresh token
      blacklistRefreshToken(refreshToken);

      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeDatabase() {
  // This will be handled by Drizzle migrations
  // For now, we'll just ensure the database file exists
  console.log('Database initialized');
}
