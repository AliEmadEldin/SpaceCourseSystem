import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.listCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", async (req, res) => {
    const course = await storage.getCourse(Number(req.params.id));
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  });

  app.post("/api/courses/:id/enroll", async (req, res) => {
    try {
      const course = await storage.enrollCourse(Number(req.params.id));
      res.json(course);
    } catch (error) {
      res.status(404).json({ message: "Course not found" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    const parsed = insertCourseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid course data" });
    }
    const course = await storage.createCourse(parsed.data);
    res.status(201).json(course);
  });

  const httpServer = createServer(app);
  return httpServer;
}
