import { User } from "../schemas"; // Предполагаем, что User схема уже есть или будет
// import { Note } from "../schemas"; // Для примера с заметками

export interface StorageAdapter {
  initialize(): Promise<void>;
  close(): Promise<void>;

  // User methods
  getUserByTelegramId(telegramId: number): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User | null>;
  updateUser(telegramId: number, userData: Partial<User>): Promise<User | null>;

  // Example methods for a "Notes" feature (можно раскомментировать и реализовать позже)
  // getNoteById(noteId: string, userId: number): Promise<Note | null>;
  // getNotesByUser(userId: number): Promise<Note[]>;
  // createNote(noteData: Partial<Note>, userId: number): Promise<Note | null>;
  // updateNote(noteId: string, noteData: Partial<Note>, userId: number): Promise<Note | null>;
  // deleteNote(noteId: string, userId: number): Promise<boolean>;
}
