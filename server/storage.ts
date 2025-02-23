import { courses, type Course, type InsertCourse } from "@shared/schema";

export interface IStorage {
  listCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  enrollCourse(id: number): Promise<Course>;
}

export class MemStorage implements IStorage {
  private courses: Map<number, Course>;
  private currentId: number;

  constructor() {
    this.courses = new Map();
    this.currentId = 1;

    // Add some initial courses
    const initialCourses: InsertCourse[] = [
      {
        title: "Introduction to Space Flight",
        description: "Learn the basics of orbital mechanics and space travel",
        imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",
        duration: 120,
        difficulty: "Beginner"
      },
      {
        title: "Advanced Rocket Propulsion",
        description: "Deep dive into rocket engines and propulsion systems",
        imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7",
        duration: 180,
        difficulty: "Advanced"
      }
    ];

    initialCourses.forEach(course => this.createCourse(course));
  }

  async listCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentId++;
    const course: Course = { ...insertCourse, id, enrolled: false };
    this.courses.set(id, course);
    return course;
  }

  async enrollCourse(id: number): Promise<Course> {
    const course = await this.getCourse(id);
    if (!course) {
      throw new Error("Course not found");
    }
    const updatedCourse = { ...course, enrolled: true };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
}

export const storage = new MemStorage();
