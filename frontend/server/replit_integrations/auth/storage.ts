import { users, type User, type UpsertUser } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

const useDatabase = Boolean(process.env.DATABASE_URL);

let dbPromise: Promise<(typeof import("../../db"))["db"]> | null = null;

async function getDb() {
  if (!useDatabase) {
    throw new Error("Database is disabled for auth storage.");
  }
  if (!dbPromise) {
    dbPromise = import("../../db").then((module) => module.db);
  }
  return dbPromise;
}

class DbAuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const db = await getDb();
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

class MemoryAuthStorage implements IAuthStorage {
  private users = new Map<string, User>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = userData.id ? this.users.get(userData.id) : undefined;
    const now = new Date();
    const id = userData.id ?? existing?.id ?? randomUUID();
    const user: User = {
      id,
      email: userData.email ?? existing?.email ?? null,
      firstName: userData.firstName ?? existing?.firstName ?? null,
      lastName: userData.lastName ?? existing?.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? existing?.profileImageUrl ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }
}

export const authStorage: IAuthStorage = useDatabase
  ? new DbAuthStorage()
  : new MemoryAuthStorage();
