import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema } from "@shared/schema";
import { authenticate, requireRole } from "./middleware/auth";
import { createUser, findUserByEmail, comparePasswords, generateToken, seedAdminUser } from "./services/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed admin user on startup
  await seedAdminUser();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await findUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await createUser(email, password);
      const token = generateToken(user);
      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await findUserByEmail(email);

      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Protected routes
  app.get("/api/courses", authenticate, async (_req, res) => {
    const courses = await storage.listCourses();
    res.json(courses);
  });

  app.get("/api/courses/:id", authenticate, async (req, res) => {
    const course = await storage.getCourse(Number(req.params.id));
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  });

  // Only authenticated users can enroll
  app.post("/api/courses/:id/enroll", authenticate, async (req, res) => {
    try {
      const course = await storage.enrollCourse(Number(req.params.id));
      res.json(course);
    } catch (error) {
      res.status(404).json({ message: "Course not found" });
    }
  });

  // Only admins can create courses
  app.post("/api/courses", authenticate, requireRole("admin"), async (req, res) => {
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