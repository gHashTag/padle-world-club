/**
 * Репозиторий для работы с моделью User
 * Содержит методы CRUD для работы с пользователями
 */
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { User, NewUser } from "../db/schema";
export declare class UserRepository {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    /**
     * Создает нового пользователя
     * @param userData Данные пользователя
     * @returns Созданный пользователь
     */
    create(userData: NewUser): Promise<User>;
    /**
     * Получает пользователя по ID
     * @param id ID пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    getById(id: string): Promise<User | null>;
    /**
     * Получает пользователя по имени пользователя
     * @param username Имя пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    getByUsername(username: string): Promise<User | null>;
    /**
     * Получает пользователя по email
     * @param email Email пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    getByEmail(email: string): Promise<User | null>;
    /**
     * Получает пользователя по номеру телефона
     * @param phone Номер телефона пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    getByPhone(phone: string): Promise<User | null>;
    /**
     * Получает пользователя по ID члена клуба
     * @param memberId ID члена клуба
     * @returns Пользователь или null, если пользователь не найден
     */
    getByMemberId(memberId: string): Promise<User | null>;
    /**
     * Получает всех пользователей
     * @returns Массив пользователей
     */
    getAll(): Promise<User[]>;
    /**
     * Обновляет данные пользователя
     * @param id ID пользователя
     * @param userData Данные для обновления
     * @returns Обновленный пользователь или null, если пользователь не найден
     */
    update(id: string, userData: Partial<NewUser>): Promise<User | null>;
    /**
     * Удаляет пользователя
     * @param id ID пользователя
     * @returns true, если пользователь успешно удален, иначе false
     */
    delete(id: string): Promise<boolean>;
}
