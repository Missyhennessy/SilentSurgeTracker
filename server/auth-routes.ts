import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

export function registerAuthRoutes(app: Express) {
  // Get current user information
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      // Only allow updating certain fields
      const allowedUpdates = ['firstName', 'lastName'];
      const filteredUpdates: any = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({ message: "No valid updates provided" });
      }

      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...currentUser,
        ...filteredUpdates,
        updatedAt: new Date(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get user session information
  app.get('/api/auth/session', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        isAuthenticated: true,
        expiresAt: user.expires_at,
        provider: 'replit',
        sessionType: 'jwt',
        claims: {
          sub: user.claims.sub,
          email: user.claims.email,
          firstName: user.claims.first_name,
          lastName: user.claims.last_name,
        }
      });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // User activity endpoint (placeholder for future implementation)
  app.get('/api/auth/activity', isAuthenticated, async (req: any, res) => {
    try {
      // This would typically fetch from a logging/analytics service
      const activities = [
        {
          id: '1',
          action: 'login',
          description: 'User logged in',
          timestamp: new Date().toISOString(),
          ip: req.ip,
        },
        {
          id: '2',
          action: 'dashboard_access',
          description: 'Accessed main dashboard',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          ip: req.ip,
        }
      ];
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
}