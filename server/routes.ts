import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBluetoothDeviceSchema, insertAudioSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bluetooth device management routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error("Failed to get devices:", error);
      res.status(500).json({ error: "Failed to retrieve devices" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const deviceData = insertBluetoothDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid device data", details: error.errors });
      } else {
        console.error("Failed to create device:", error);
        res.status(500).json({ error: "Failed to create device" });
      }
    }
  });

  app.put("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const device = await storage.updateDevice(id, updates);
      if (!device) {
        res.status(404).json({ error: "Device not found" });
        return;
      }
      res.json(device);
    } catch (error) {
      console.error("Failed to update device:", error);
      res.status(500).json({ error: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDevice(id);
      if (!success) {
        res.status(404).json({ error: "Device not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete device:", error);
      res.status(500).json({ error: "Failed to delete device" });
    }
  });

  // Audio session management routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Failed to get sessions:", error);
      res.status(500).json({ error: "Failed to retrieve sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertAudioSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid session data", details: error.errors });
      } else {
        console.error("Failed to create session:", error);
        res.status(500).json({ error: "Failed to create session" });
      }
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateSession(id, updates);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      console.error("Failed to update session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Get active sessions for a device
  app.get("/api/devices/:id/sessions", async (req, res) => {
    try {
      const deviceId = parseInt(req.params.id);
      const sessions = await storage.getDeviceSessions(deviceId);
      res.json(sessions);
    } catch (error) {
      console.error("Failed to get device sessions:", error);
      res.status(500).json({ error: "Failed to retrieve device sessions" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
