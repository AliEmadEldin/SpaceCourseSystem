import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { users, type InsertUser, type User } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user: { id: number; role: string }): string {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export async function verifyToken(token: string): Promise<{ id: number; role: string }> {
  return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
}

export async function createUser(email: string, password: string, role: string = "student"): Promise<User> {
  const hashedPassword = await hashPassword(password);
  const [user] = await db.insert(users)
    .values({ email, password: hashedPassword, role })
    .returning();
  return user;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function seedAdminUser() {
  const adminEmail = "admin@spacecourse.com";
  const adminPassword = "SpaceAdmin123";
  const adminRole = "admin";

  const existingAdmin = await findUserByEmail(adminEmail);
  if (!existingAdmin) {
    await createUser(adminEmail, adminPassword, adminRole);
    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin user already exists");
  }
}
