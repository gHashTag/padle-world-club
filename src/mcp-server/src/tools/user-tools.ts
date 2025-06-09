/**
 * MCP Tools for User operations
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SimpleUserRepository } from "../simple-user-repository.js";
import { getDatabase } from "../database.js";

// Zod schemas for validation
const CreateUserSchema = z.object({
  username: z.string().min(1).max(255),
  passwordHash: z.string().min(1).max(255),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  memberId: z.string().min(1).max(50),
  userRole: z.enum(["admin", "manager", "instructor", "member"]),
  currentRating: z.number().default(1500.0),
  bonusPoints: z.number().default(0),
  profileImageUrl: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  homeVenueId: z.string().uuid().optional(),
  isAccountVerified: z.boolean().default(false)
});

const UpdateUserSchema = z.object({
  username: z.string().min(1).max(255).optional(),
  passwordHash: z.string().min(1).max(255).optional(),
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  memberId: z.string().min(1).max(50).optional(),
  userRole: z.enum(["admin", "manager", "instructor", "member"]).optional(),
  currentRating: z.number().optional(),
  bonusPoints: z.number().optional(),
  profileImageUrl: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.string().optional(),
  homeVenueId: z.string().uuid().optional(),
  isAccountVerified: z.boolean().optional()
});

/**
 * Register User tools with MCP server
 */
export function registerUserTools(server: McpServer) {
  const db = getDatabase();
  const userRepository = new SimpleUserRepository(db);

  // Create User tool
  server.tool(
    "create_user",
    CreateUserSchema.shape,
    async (params) => {
      try {
        const userData = {
          ...params,
          dateOfBirth: params.dateOfBirth ? new Date(params.dateOfBirth) : undefined
        };

        const user = await userRepository.create(userData as any);

        return {
          content: [{
            type: "text",
            text: `✅ Пользователь создан успешно!\n\n` +
                  `ID: ${user.id}\n` +
                  `Username: ${user.username}\n` +
                  `Email: ${user.email}\n` +
                  `Имя: ${user.firstName} ${user.lastName}\n` +
                  `Роль: ${user.userRole}\n` +
                  `Рейтинг: ${user.currentRating}\n` +
                  `Создан: ${user.createdAt}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка создания пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );

  // Get User by ID tool
  server.tool(
    "get_user_by_id",
    { id: z.string().uuid() },
    async ({ id }) => {
      try {
        const user = await userRepository.getById(id);

        if (!user) {
          return {
            content: [{
              type: "text",
              text: `❌ Пользователь с ID ${id} не найден`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `👤 Пользователь найден:\n\n` +
                  `ID: ${user.id}\n` +
                  `Username: ${user.username}\n` +
                  `Email: ${user.email}\n` +
                  `Имя: ${user.firstName} ${user.lastName}\n` +
                  `Телефон: ${user.phone || 'не указан'}\n` +
                  `Member ID: ${user.memberId}\n` +
                  `Роль: ${user.userRole}\n` +
                  `Рейтинг: ${user.currentRating}\n` +
                  `Бонусные очки: ${user.bonusPoints}\n` +
                  `Пол: ${user.gender || 'не указан'}\n` +
                  `Дата рождения: ${user.dateOfBirth || 'не указана'}\n` +
                  `Аккаунт подтвержден: ${user.isAccountVerified ? 'Да' : 'Нет'}\n` +
                  `Последний вход: ${user.lastLoginAt || 'никогда'}\n` +
                  `Создан: ${user.createdAt}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка получения пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );

  // Get User by Username tool
  server.tool(
    "get_user_by_username",
    { username: z.string().min(1) },
    async ({ username }) => {
      try {
        const user = await userRepository.getByUsername(username);

        if (!user) {
          return {
            content: [{
              type: "text",
              text: `❌ Пользователь с username "${username}" не найден`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `👤 Пользователь найден:\n\n` +
                  `ID: ${user.id}\n` +
                  `Username: ${user.username}\n` +
                  `Email: ${user.email}\n` +
                  `Имя: ${user.firstName} ${user.lastName}\n` +
                  `Роль: ${user.userRole}\n` +
                  `Рейтинг: ${user.currentRating}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка поиска пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );

  // Get User by Email tool
  server.tool(
    "get_user_by_email",
    { email: z.string().email() },
    async ({ email }) => {
      try {
        const user = await userRepository.getByEmail(email);

        if (!user) {
          return {
            content: [{
              type: "text",
              text: `❌ Пользователь с email "${email}" не найден`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `👤 Пользователь найден:\n\n` +
                  `ID: ${user.id}\n` +
                  `Username: ${user.username}\n` +
                  `Email: ${user.email}\n` +
                  `Имя: ${user.firstName} ${user.lastName}\n` +
                  `Роль: ${user.userRole}\n` +
                  `Рейтинг: ${user.currentRating}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка поиска пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );

  // Update User tool
  server.tool(
    "update_user",
    {
      id: z.string().uuid(),
      ...UpdateUserSchema.shape
    },
    async ({ id, ...updateData }) => {
      try {
        // Remove undefined values
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined)
        );

        if (cleanUpdateData.dateOfBirth) {
          (cleanUpdateData as any).dateOfBirth = new Date(cleanUpdateData.dateOfBirth as string);
        }

        const user = await userRepository.update(id, cleanUpdateData as any);

        if (!user) {
          return {
            content: [{
              type: "text",
              text: `❌ Пользователь с ID ${id} не найден`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `✅ Пользователь обновлен успешно!\n\n` +
                  `ID: ${user.id}\n` +
                  `Username: ${user.username}\n` +
                  `Email: ${user.email}\n` +
                  `Имя: ${user.firstName} ${user.lastName}\n` +
                  `Роль: ${user.userRole}\n` +
                  `Рейтинг: ${user.currentRating}\n` +
                  `Обновлен: ${user.updatedAt}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка обновления пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );

  // Delete User tool
  server.tool(
    "delete_user",
    { id: z.string().uuid() },
    async ({ id }) => {
      try {
        const success = await userRepository.delete(id);

        if (!success) {
          return {
            content: [{
              type: "text",
              text: `❌ Пользователь с ID ${id} не найден`
            }]
          };
        }

        return {
          content: [{
            type: "text",
            text: `✅ Пользователь с ID ${id} успешно удален`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка удаления пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );

  // List Users tool
  server.tool(
    "list_users",
    { limit: z.number().min(1).max(100).optional() },
    async ({ limit }) => {
      try {
        const users = await userRepository.getAll();
        const limitedUsers = users.slice(0, limit || 10);

        if (limitedUsers.length === 0) {
          return {
            content: [{
              type: "text",
              text: "📋 Пользователи не найдены"
            }]
          };
        }

        const usersList = limitedUsers.map((user, index) =>
          `${index + 1}. ${user.firstName} ${user.lastName} (@${user.username})\n` +
          `   ID: ${user.id}\n` +
          `   Email: ${user.email}\n` +
          `   Роль: ${user.userRole}\n` +
          `   Рейтинг: ${user.currentRating}`
        ).join('\n\n');

        return {
          content: [{
            type: "text",
            text: `📋 Список пользователей (показано ${limitedUsers.length} из ${users.length}):\n\n${usersList}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Ошибка получения списка пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          }],
          isError: true
        };
      }
    }
  );
}
