import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  switchProtocol, 
  getLabStatus, 
  getDiagnostics, 
  getAllowedProtocols,
  isGuestAllowedProtocol,
  type Protocol 
} from "./lib/lab-client";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Blog endpoints
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Protocol endpoints (single page per protocol)
  app.get("/api/protocols", async (req, res) => {
    try {
      const protocols = await storage.getProtocols();
      res.json(protocols);
    } catch (error) {
      console.error("Error fetching protocols:", error);
      res.status(500).json({ error: "Failed to fetch protocols" });
    }
  });

  app.get("/api/protocols/:id", async (req, res) => {
    try {
      const protocol = await storage.getProtocol(req.params.id);
      if (!protocol) {
        return res.status(404).json({ error: "Protocol not found" });
      }
      res.json(protocol);
    } catch (error) {
      console.error("Error fetching protocol:", error);
      res.status(500).json({ error: "Failed to fetch protocol" });
    }
  });

  // Lab control endpoints (for external Docker backend integration)
  app.post("/api/lab/switch", async (req, res) => {
    try {
      const { protocol } = req.body as { protocol: Protocol };
      
      if (!protocol) {
        return res.status(400).json({ error: "Protocol is required" });
      }

      const validProtocols: Protocol[] = ["modbus", "opcua", "cip", "dnp3", "iec104", "mqtt", "s7", "bacnet"];
      if (!validProtocols.includes(protocol)) {
        return res.status(400).json({ error: "Invalid protocol" });
      }

      const isAuthenticated = req.isAuthenticated() && !!(req.user as any)?.claims?.sub;
      
      if (!isAuthenticated && !isGuestAllowedProtocol(protocol)) {
        return res.status(403).json({ 
          error: "Authentication required",
          message: "Please sign in to access this protocol. Guest users can only access the Modbus lab."
        });
      }

      const result = await switchProtocol(protocol, isAuthenticated);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json({ error: result.message });
      }
    } catch (error) {
      console.error("Error switching protocol:", error);
      res.status(500).json({ error: "Failed to switch protocol" });
    }
  });

  app.get("/api/lab/status", async (req, res) => {
    try {
      const { protocol } = req.query as { protocol?: Protocol };
      const status = await getLabStatus(protocol);
      res.json(status);
    } catch (error) {
      console.error("Error getting lab status:", error);
      res.status(500).json({ error: "Failed to get lab status" });
    }
  });

  app.get("/api/lab/diagnostics", async (req, res) => {
    try {
      const diagnostics = await getDiagnostics();
      res.json(diagnostics);
    } catch (error) {
      console.error("Error getting diagnostics:", error);
      res.status(500).json({ error: "Failed to get diagnostics" });
    }
  });

  app.get("/api/lab/protocols", async (req, res) => {
    try {
      const isAuthenticated = req.isAuthenticated() && !!(req.user as any)?.claims?.sub;
      const protocols = getAllowedProtocols(isAuthenticated);
      res.json({ 
        protocols,
        isAuthenticated,
        guestProtocols: ["modbus"],
        allProtocols: ["modbus", "opcua", "cip", "dnp3", "iec104", "mqtt", "s7", "bacnet"]
      });
    } catch (error) {
      console.error("Error getting allowed protocols:", error);
      res.status(500).json({ error: "Failed to get allowed protocols" });
    }
  });

  // Tools endpoints
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:slug", async (req, res) => {
    try {
      const tool = await storage.getTool(req.params.slug);
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ error: "Failed to fetch tool" });
    }
  });

  return httpServer;
}
