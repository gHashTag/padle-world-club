/**
 * Simplified User Repository for MCP Server
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { users, User, NewUser } from "./simple-user-schema.js";

type Database = ReturnType<typeof drizzle<{ users: typeof users }>>;

export class SimpleUserRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a new user
   */
  async create(userData: NewUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        ...userData,
        currentRating: userData.currentRating || 1500.0,
        bonusPoints: userData.bonusPoints || 0,
        isAccountVerified: userData.isAccountVerified || false,
      } as any)
      .returning();
    return user as User;
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return result.length > 0 ? (result[0] as User) : null;
  }

  /**
   * Get user by username
   */
  async getByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));

    return result.length > 0 ? (result[0] as User) : null;
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result.length > 0 ? (result[0] as User) : null;
  }

  /**
   * Update user
   */
  async update(id: string, updateData: Partial<NewUser>): Promise<User | null> {
    const [updatedUser] = await this.db
      .update(users)
      .set(updateData as any)
      .where(eq(users.id, id))
      .returning();

    return updatedUser ? (updatedUser as User) : null;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const [deletedUser] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return !!deletedUser;
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const result = await this.db.select().from(users);
    return result as User[];
  }
}
