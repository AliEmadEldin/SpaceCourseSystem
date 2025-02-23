import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  duration: integer("duration").notNull(), // in minutes
  difficulty: text("difficulty").notNull(),
  enrolled: boolean("enrolled").default(false)
});

export const insertCourseSchema = createInsertSchema(courses).omit({ 
  id: true,
  enrolled: true
});

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
