import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema, insertUserSchema } from "@shared/schema";
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

  // User Management Routes (Protected)
  const isAdminOrSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== "admin" && req.user?.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  };

  // List users (Admin only)
  app.get("/api/users", authenticate, isAdminOrSuperAdmin, async (_req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get single user (Admin only)
  app.get("/api/users/:id", authenticate, isAdminOrSuperAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user (Admin only)
  app.put("/api/users/:id", authenticate, isAdminOrSuperAdmin, async (req, res) => {
    try {
      const parsed = insertUserSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      const user = await storage.updateUser(Number(req.params.id), parsed.data);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (Admin only)
  app.delete("/api/users/:id", authenticate, isAdminOrSuperAdmin, async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Course Management Routes
  // List courses with search and filters
  app.get("/api/courses", authenticate, async (req, res) => {
    try {
      const { title, minPrice, maxPrice } = req.query;
      const filters = {
        ...(title && { title: String(title) }),
        ...(minPrice && { minPrice: Number(minPrice) }),
        ...(maxPrice && { maxPrice: Number(maxPrice) })
      };
      const courses = await storage.listCourses(filters);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get single course
  app.get("/api/courses/:id", authenticate, async (req, res) => {
    try {
      const course = await storage.getCourse(Number(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create course (Instructor only)
  app.post("/api/courses", authenticate, requireRole("instructor"), async (req, res) => {
    try {
      const parsed = insertCourseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid course data" });
      }

      const course = await storage.createCourse(parsed.data);
      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update course (Instructor only)
  app.put("/api/courses/:id", authenticate, requireRole("instructor"), async (req, res) => {
    try {
      const parsed = insertCourseSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid course data" });
      }

      const course = await storage.updateCourse(Number(req.params.id), parsed.data);
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete course (Instructor only)
  app.delete("/api/courses/:id", authenticate, requireRole("instructor"), async (req, res) => {
    try {
      await storage.deleteCourse(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment Management Routes
  // List enrolled courses for the authenticated user
  app.get("/api/enrollments/my-courses", authenticate, async (req, res) => {
    try {
      const courses = await storage.listEnrolledCourses(req.user!.id);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrolled courses" });
    }
  });

  // Enroll in course (Any authenticated user)
  app.post("/api/enrollments", authenticate, async (req, res) => {
    try {
      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      const enrollment = await storage.enrollUserInCourse(req.user!.id, Number(courseId));
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof Error && error.message === "User is already enrolled in this course") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}