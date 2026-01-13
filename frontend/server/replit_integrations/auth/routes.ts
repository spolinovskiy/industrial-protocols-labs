import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import type { User } from "@shared/models/auth";

const localAuthMode = process.env.LOCAL_AUTH_MODE || "disabled";
const localAuthEnabled = localAuthMode !== "disabled";
const localUser: User = {
  id: "local-user",
  email: "local@lab",
  firstName: "Local",
  lastName: "User",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      if (localAuthEnabled) {
        return res.json(localUser);
      }
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
