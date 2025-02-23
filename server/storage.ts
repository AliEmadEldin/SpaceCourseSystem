import { courses, type Course, type InsertCourse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  listCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  enrollCourse(id: number): Promise<Course>;
}

export class DatabaseStorage implements IStorage {
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