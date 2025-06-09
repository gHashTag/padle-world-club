/**
 * MCP Resources for User data
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SimpleUserRepository } from "../simple-user-repository.js";
import { getDatabase } from "../database.js";

/**
 * Register User resources with MCP server
 */
export function registerUserResources(server: McpServer) {
  const db = getDatabase();
  const userRepository = new SimpleUserRepository(db);

  // User profile resource - get user data by ID
  server.resource(
    "user-profile",
    new ResourceTemplate("user://profile/{userId}", { list: undefined }),
    async (uri, { userId }) => {
      try {
        const user = await userRepository.getById(userId as string);

        if (!user) {
          return {
            contents: [{
              uri: uri.href,
              text: `Пользователь с ID ${userId} не найден`,
              mimeType: "text/plain"
            }]
          };
        }

        const userProfile = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          memberId: user.memberId,
          userRole: user.userRole,
          currentRating: user.currentRating,
          bonusPoints: user.bonusPoints,
          profileImageUrl: user.profileImageUrl,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          homeVenueId: user.homeVenueId,
          isAccountVerified: user.isAccountVerified,
          lastLoginAt: user.lastLoginAt,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(userProfile, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Ошибка получения профиля пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );

  // User search resource - find user by username
  server.resource(
    "user-search",
    new ResourceTemplate("user://search/{username}", { list: undefined }),
    async (uri, { username }) => {
      try {
        const user = await userRepository.getByUsername(username as string);

        if (!user) {
          return {
            contents: [{
              uri: uri.href,
              text: `Пользователь с username "${username}" не найден`,
              mimeType: "text/plain"
            }]
          };
        }

        const userInfo = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userRole: user.userRole,
          currentRating: user.currentRating,
          isAccountVerified: user.isAccountVerified,
          createdAt: user.createdAt
        };

        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(userInfo, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Ошибка поиска пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );

  // Users list resource
  server.resource(
    "users-list",
    "users://list",
    async (uri) => {
      try {
        const users = await userRepository.getAll();

        const usersList = users.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userRole: user.userRole,
          currentRating: user.currentRating,
          isAccountVerified: user.isAccountVerified,
          createdAt: user.createdAt
        }));

        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(usersList, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Ошибка получения списка пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );

  // User statistics resource
  server.resource(
    "user-stats",
    "users://stats",
    async (uri) => {
      try {
        const users = await userRepository.getAll();

        const stats = {
          totalUsers: users.length,
          usersByRole: users.reduce((acc, user) => {
            acc[user.userRole] = (acc[user.userRole] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          verifiedUsers: users.filter(user => user.isAccountVerified).length,
          averageRating: users.length > 0
            ? users.reduce((sum, user) => sum + parseFloat(user.currentRating), 0) / users.length
            : 0,
          usersWithPhone: users.filter(user => user.phone).length,
          usersWithProfileImage: users.filter(user => user.profileImageUrl).length,
          recentUsers: users
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(user => ({
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: user.createdAt
            }))
        };

        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(stats, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Ошибка получения статистики пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
            mimeType: "text/plain"
          }]
        };
      }
    }
  );
}
