/**
 * Репозиторий для работы с моделью User
 * Содержит методы CRUD для работы с пользователями
 */
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
export class UserRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * Создает нового пользователя
     * @param userData Данные пользователя
     * @returns Созданный пользователь
     */
    async create(userData) {
        const [user] = await this.db.insert(users).values(userData).returning();
        return user;
    }
    /**
     * Получает пользователя по ID
     * @param id ID пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    async getById(id) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.id, id));
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Получает пользователя по имени пользователя
     * @param username Имя пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    async getByUsername(username) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.username, username));
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Получает пользователя по email
     * @param email Email пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    async getByEmail(email) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Получает пользователя по номеру телефона
     * @param phone Номер телефона пользователя
     * @returns Пользователь или null, если пользователь не найден
     */
    async getByPhone(phone) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.phone, phone));
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Получает пользователя по ID члена клуба
     * @param memberId ID члена клуба
     * @returns Пользователь или null, если пользователь не найден
     */
    async getByMemberId(memberId) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.memberId, memberId));
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Получает всех пользователей
     * @returns Массив пользователей
     */
    async getAll() {
        return await this.db.select().from(users);
    }
    /**
     * Обновляет данные пользователя
     * @param id ID пользователя
     * @param userData Данные для обновления
     * @returns Обновленный пользователь или null, если пользователь не найден
     */
    async update(id, userData) {
        const [updatedUser] = await this.db
            .update(users)
            .set(userData)
            .where(eq(users.id, id))
            .returning();
        return updatedUser || null;
    }
    /**
     * Удаляет пользователя
     * @param id ID пользователя
     * @returns true, если пользователь успешно удален, иначе false
     */
    async delete(id) {
        const [deletedUser] = await this.db
            .delete(users)
            .where(eq(users.id, id))
            .returning();
        return !!deletedUser;
    }
}
