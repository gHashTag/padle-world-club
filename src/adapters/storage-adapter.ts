import { User, NotificationSettings } from "../schemas";
// import { Note } from "../schemas"; // Для примера с заметками
import { SessionData } from "../bot"; // SessionData из bot.ts (расширяет TelegrafSessionData)

export interface StorageAdapter {
  // Методы из SessionStore<T>
  get(key: string): Promise<SessionData | undefined>;
  set(key: string, session: SessionData, ttl?: number): Promise<void>; // ttl опционален в Telegraf SessionStore
  delete(key: string): Promise<void>;

  // Наши кастомные методы
  initialize?(): Promise<void>;
  close?(): Promise<void>;

  // User methods
  getUserByTelegramId(telegramId: number): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User | null>;
  updateUser(telegramId: number, userData: Partial<User>): Promise<User | null>;

  // Notification Settings methods
  getNotificationSettings(userId: string): Promise<NotificationSettings | null>;
  createNotificationSettings(
    userId: string,
    settings?: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null>;
  updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null>;

  // Example methods for a "Notes" feature (можно раскомментировать и реализовать позже)
  // getNoteById(noteId: string, userId: string): Promise<Note | null>; // userId должен быть string, если Note связан с User.id
  // getNotesByUser(userId: string): Promise<Note[]>;
  // createNote(noteData: Partial<Note>, userId: string): Promise<Note | null>;
  // updateNote(noteId: string, noteData: Partial<Note>, userId: string): Promise<Note | null>;
  // deleteNote(noteId: string, userId: string): Promise<boolean>;
}
