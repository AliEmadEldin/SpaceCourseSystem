import { courses, users, enrollments, liveSessions, content, type Course, type InsertCourse, type User, type InsertUser, type Enrollment, type InsertEnrollment, type LiveSession, type InsertLiveSession, type Content, type InsertContent } from "@shared/schema";
import { db } from "./db";
import { eq, like, lte, gte, and, or } from "drizzle-orm";

export interface IStorage {
  // User management
  listUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Course management
  listCourses(filters?: {
    title?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  // Enrollment management
  listEnrolledCourses(userId: number): Promise<Course[]>;
  enrollUserInCourse(userId: number, courseId: number): Promise<Enrollment>;
  isUserEnrolled(userId: number, courseId: number): Promise<boolean>;

  // Live session management
  createLiveSession(session: InsertLiveSession): Promise<LiveSession>;
  getLiveSession(id: number): Promise<LiveSession | undefined>;
  listLiveSessions(courseId: number): Promise<LiveSession[]>;

  // Content management
  addContent(content: InsertContent): Promise<Content>;
  listCourseContent(courseId: number): Promise<Content[]>;
}

export class DatabaseStorage implements IStorage {
  // User management methods remain unchanged
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

  // Enhanced course management methods
  async listCourses(filters?: {
    title?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Course[]> {
    let conditions = [];

    if (filters?.title) {
      conditions.push(like(courses.title, `%${filters.title}%`));
    }

    if (filters?.minPrice !== undefined) {
      conditions.push(gte(courses.price!, filters.minPrice));
    }

    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(courses.price!, filters.maxPrice));
    }

    const query = conditions.length > 0
      ? db.select().from(courses).where(and(...conditions))
      : db.select().from(courses);

    return await query;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses)
      .values({
        ...course,
        enrolled: false,
      })
      .returning();
    return newCourse;
  }

  async updateCourse(id: number, courseUpdate: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set(courseUpdate)
      .where(eq(courses.id, id))
      .returning();

    if (!updatedCourse) {
      throw new Error("Course not found");
    }

    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // New enrollment management methods
  async listEnrolledCourses(userId: number): Promise<Course[]> {
    const enrolledCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        imageUrl: courses.imageUrl,
        duration: courses.duration,
        difficulty: courses.difficulty,
        enrolled: courses.enrolled,
        instructorId: courses.instructorId,
        price: courses.price
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));

    return enrolledCourses;
  }

  async isUserEnrolled(userId: number, courseId: number): Promise<boolean> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));

    return !!enrollment;
  }

  async enrollUserInCourse(userId: number, courseId: number): Promise<Enrollment> {
    // Check if already enrolled
    const isEnrolled = await this.isUserEnrolled(userId, courseId);
    if (isEnrolled) {
      throw new Error("User is already enrolled in this course");
    }

    // Verify course exists
    const course = await this.getCourse(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Create enrollment
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId,
        courseId
      })
      .returning();

    return enrollment;
  }

  // Live session management methods
  async createLiveSession(session: InsertLiveSession): Promise<LiveSession> {
    const [newSession] = await db
      .insert(liveSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getLiveSession(id: number): Promise<LiveSession | undefined> {
    const [session] = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, id));
    return session;
  }

  async listLiveSessions(courseId: number): Promise<LiveSession[]> {
    return await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.courseId, courseId))
      .orderBy(liveSessions.startTime);
  }

  // Content management methods
  async addContent(contentData: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(content)
      .values(contentData)
      .returning();
    return newContent;
  }

  async listCourseContent(courseId: number): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(eq(content.courseId, courseId));
  }
}

export const storage = new DatabaseStorage();