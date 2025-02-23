import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull()
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  duration: integer("duration").notNull(), // in minutes
  difficulty: text("difficulty").notNull(),
  enrolled: boolean("enrolled").default(false),
  instructorId: integer("instructor_id").references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 })
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow()
});

export const liveSessions = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  zoomLink: text("zoom_link").notNull()
});

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  type: text("type").notNull(),
  url: text("url").notNull()
});

// Define relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  enrollments: many(enrollments),
  liveSessions: many(liveSessions),
  content: many(content)
}));

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments)
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  enrolled: true
});
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrollmentDate: true
});
export const insertLiveSessionSchema = createInsertSchema(liveSessions).omit({
  id: true
});
export const insertContentSchema = createInsertSchema(content).omit({
  id: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type InsertLiveSession = z.infer<typeof insertLiveSessionSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type LiveSession = typeof liveSessions.$inferSelect;
export type Content = typeof content.$inferSelect;