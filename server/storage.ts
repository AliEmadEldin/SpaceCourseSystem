import { courses, users, type Course, type InsertCourse, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User management
  listUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Existing course methods
  listCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  enrollCourse(id: number): Promise<Course>;
}

export class DatabaseStorage implements IStorage {
  // User management methods
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Existing course methods remain unchanged
  async listCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values({
      ...course,
      enrolled: false,
      instructorId: null,
      price: null
    }).returning();
    return newCourse;
  }

  async enrollCourse(id: number): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ enrolled: true })
      .where(eq(courses.id, id))
      .returning();

    if (!updatedCourse) {
      throw new Error("Course not found");
    }

    return updatedCourse;
  }
}

export const storage = new DatabaseStorage();