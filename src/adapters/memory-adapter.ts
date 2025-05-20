import { StorageAdapter } from "./storage-adapter";
import { User } from "../schemas";
// import { Note } from "../schemas"; // Для примера с заметками

export class MemoryAdapter implements StorageAdapter {
  private users: User[] = [];
  // private notes: Note[] = []; // Для примера с заметками
  private userIdCounter = 1;
  // private noteIdCounter = 1; // Для примера с заметками

  async initialize(): Promise<void> {
    console.log("MemoryAdapter initialized");
  }

  async close(): Promise<void> {
    console.log("MemoryAdapter closed");
  }

  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    const user = this.users.find((u) => u.telegram_id === telegramId);
    return user || null;
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    if (!userData.telegram_id) {
      throw new Error("telegram_id is required to create a user");
    }
    const existingUser = await this.getUserByTelegramId(userData.telegram_id);
    if (existingUser) {
      // Можно либо возвращать существующего, либо выбрасывать ошибку
      // throw new Error("User with this telegram_id already exists");
      return existingUser;
    }

    const newUser: User = {
      id: this.userIdCounter++, // Простое автоинкрементное ID для примера
      telegram_id: userData.telegram_id,
      username: userData.username || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      created_at: new Date().toISOString(),
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      // Добавьте остальные поля из User схемы со значениями по умолчанию, если нужно
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(
    telegramId: number,
    userData: Partial<User>
  ): Promise<User | null> {
    const userIndex = this.users.findIndex((u) => u.telegram_id === telegramId);
    if (userIndex === -1) {
      return null;
    }
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
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
