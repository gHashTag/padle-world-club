import { StorageAdapter } from "./storage-adapter";
import {
  User,
  NotificationSettings,
  NotificationSettingsSchema,
} from "../schemas";
import { randomUUID } from "crypto"; // Для генерации UUID
import { SessionData } from "../bot"; // Импортируем SessionData из bot.ts
// import { Note } from "../schemas"; // Для примера с заметками
import { logger } from "../utils/logger";

export class MemoryAdapter implements StorageAdapter {
  private users: User[] = [];
  private notificationSettings: NotificationSettings[] = []; // Хранилище для настроек уведомлений
  private sessions: Map<string, SessionData> = new Map(); // Хранилище для сессий
  // private notes: Note[] = []; // Для примера с заметками
  // private userIdCounter = 1; // Больше не нужен, используем UUID
  // private noteIdCounter = 1; // Для примера с заметками

  async initialize(): Promise<void> {
    console.log("MemoryAdapter initialized");
  }

  async close(): Promise<void> {
    console.log("MemoryAdapter closed");
  }

  // --- SessionStore<SessionData> implementation ---
  async get(key: string): Promise<SessionData | undefined> {
    console.log(`MemoryAdapter: get session for key ${key}`);
    return this.sessions.get(key);
  }

  async set(key: string, session: SessionData): Promise<void> {
    console.log(`MemoryAdapter: set session for key ${key}`, session);
    this.sessions.set(key, session);
  }

  async delete(key: string): Promise<void> {
    console.log(`MemoryAdapter: delete session for key ${key}`);
    this.sessions.delete(key);
  }
  // --- End of SessionStore<SessionData> implementation ---

  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    const user = this.users.find((u) => u.telegram_id === telegramId);
    return user ? { ...user } : null;
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    const newUser: User = {
      id: randomUUID(),
      telegram_id: userData.telegram_id || 0, // Должен быть предоставлен
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      // Убедимся, что поля соответствуют UserSchema, включая опциональные
      language_code: userData.language_code,
      is_bot: userData.is_bot,
      subscription_level: userData.subscription_level || "free", // Добавлено
      last_active_at: userData.last_active_at || new Date(), // Добавлено
      created_at: new Date().toISOString(), // Используем toISOString()
      updated_at: new Date().toISOString(), // Используем toISOString()
      // Добавляем остальные поля из UserSchema со значениями по умолчанию или undefined
      // authId: userData.authId,
      // email: userData.email,
      // avatarUrl: userData.avatarUrl,
      // email_verified: userData.email_verified || false,
      // phone_number: userData.phone_number,
      // custom_data: userData.custom_data,
      // roles: userData.roles || [],
      // subscription_expires_at: userData.subscription_expires_at ? new Date(userData.subscription_expires_at).toISOString() : undefined,
    };
    this.users.push(newUser);
    logger.debug(
      `[MemoryAdapter] User created: ${newUser.id} for telegram_id ${newUser.telegram_id}`
    );
    return newUser;
  }

  async updateUser(
    telegramId: number,
    userData: Partial<User>
  ): Promise<User | null> {
    const userIndex = this.users.findIndex((u) => u.telegram_id === telegramId);
    if (userIndex === -1) {
      logger.warn(`[MemoryAdapter] User not found for update: ${telegramId}`);
      return null;
    }
    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updated_at: new Date().toISOString(), // Обновляем дату изменения, используем toISOString()
    };
    this.users[userIndex] = updatedUser;
    logger.debug(`[MemoryAdapter] User updated: ${updatedUser.id}`);
    return updatedUser;
  }

  // --- Notification Settings methods ---
  async getNotificationSettings(
    userId: string
  ): Promise<NotificationSettings | null> {
    const settings = this.notificationSettings.find((s) => s.userId === userId);
    return settings ? { ...settings } : null;
  }

  async createNotificationSettings(
    userId: string,
    settings?: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null> {
    const existingSettings = await this.getNotificationSettings(userId);
    if (existingSettings) {
      // Можно вернуть существующие или обновить их, или выбросить ошибку
      // Для примера, вернем существующие, если не переданы новые для создания поверх
      if (!settings || Object.keys(settings).length === 0)
        return existingSettings;
      // Если переданы настройки, то это больше похоже на update, но можно и так, если логика позволяет
      // throw new Error("NotificationSettings for this user already exist. Use updateNotificationSettings.");
    }

    const defaultSettings: NotificationSettings = {
      userId: userId,
      enabled: true,
      daily_summary: false,
      new_content_alerts: false,
      language: "ru",
      ...(settings || {}), // применяем переданные настройки поверх дефолтных
    };

    // Валидация через Zod schema (опционально, но хорошо для надежности)
    const parsedSettings =
      NotificationSettingsSchema.safeParse(defaultSettings);
    if (!parsedSettings.success) {
      console.error(
        "MemoryAdapter: createNotificationSettings validation failed",
        parsedSettings.error.format()
      );
      return null;
    }

    this.notificationSettings.push(parsedSettings.data);
    return { ...parsedSettings.data };
  }

  async updateNotificationSettings(
    userId: string,
    settingsUpdate: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null> {
    const settingsIndex = this.notificationSettings.findIndex(
      (s) => s.userId === userId
    );
    if (settingsIndex === -1) {
      // Если настроек нет, можно создать их с переданными обновлениями
      // или вернуть null, указывая, что обновлять нечего
      // Для примера, создадим новые, если их нет
      return this.createNotificationSettings(userId, settingsUpdate);
    }

    const updatedSettingsData = {
      ...this.notificationSettings[settingsIndex],
      ...settingsUpdate,
    };

    const parsedSettings =
      NotificationSettingsSchema.safeParse(updatedSettingsData);
    if (!parsedSettings.success) {
      console.error(
        "MemoryAdapter: updateNotificationSettings validation failed",
        parsedSettings.error.format()
      );
      return null;
    }

    this.notificationSettings[settingsIndex] = parsedSettings.data;
    return { ...parsedSettings.data };
  }

  // --- Example methods for a "Notes" feature ---
  // async getNoteById(noteId: string, userId: number): Promise<Note | null> {
  //   const note = this.notes.find(n => n.id === noteId && n.userId === userId);
  //   return note || null;
  // }

  // async getNotesByUser(userId: number): Promise<Note[]> {
  //   return this.notes.filter(n => n.userId === userId);
  // }

  // async createNote(noteData: Partial<Note>, userId: number): Promise<Note | null> {
  //   if (!noteData.title) {
  //     throw new Error("Title is required for a note");
  //   }
  //   const newNote: Note = {
  //     id: (this.noteIdCounter++).toString(),
  //     userId,
  //     title: noteData.title,
  //     content: noteData.content || "",
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
  //   this.notes.push(newNote);
  //   return newNote;
  // }

  // async updateNote(noteId: string, noteData: Partial<Note>, userId: number): Promise<Note | null> {
  //   const noteIndex = this.notes.findIndex(n => n.id === noteId && n.userId === userId);
  //   if (noteIndex === -1) {
  //     return null;
  //   }
  //   this.notes[noteIndex] = {
  //     ...this.notes[noteIndex],
  //     ...noteData,
  //     updatedAt: new Date().toISOString()
  //   };
  //   return this.notes[noteIndex];
  // }

  // async deleteNote(noteId: string, userId: number): Promise<boolean> {
  //   const noteIndex = this.notes.findIndex(n => n.id === noteId && n.userId === userId);
  //   if (noteIndex === -1) {
  //     return false;
  //   }
  //   this.notes.splice(noteIndex, 1);
  //   return true;
  // }
}
