/**
 * Схема базы данных Drizzle ORM для Padle World Club
 * Этот файл является точкой входа для всех схем таблиц.
 */

// Напрямую экспортируем константы таблиц и перечислений
export * from "./schema/enums";
export * from "./schema/user";
export * from "./schema/userAccountLink";

// TODO: Импортировать остальные схемы по мере их создания
// export * from "./schema/venue";
// export * from "./schema/court";
// ... и так далее

// Для удобства Drizzle Kit и некоторых сценариев импорта можно также оставить default export
// Но для генерации миграций он, похоже, не требовался или мешал.
// Для ясности можно импортировать все в объект и экспортировать его по умолчанию.
import * as enums from "./schema/enums";
import * as userSchema from "./schema/user";
import * as userAccountLinkSchema from "./schema/userAccountLink";

const allSchema = {
  ...enums,
  ...userSchema,
  ...userAccountLinkSchema,
  // ...venueSchema, // Раскомментировать по мере добавления
  // ...courtSchema,
};
export default allSchema;

// Типы на основе схемы

// Тип для пользователя из базы данных
export type User = typeof userSchema.users.$inferSelect;
export type NewUser = typeof userSchema.users.$inferInsert;

// Тип для связи аккаунтов пользователя
export type UserAccountLink =
  typeof userAccountLinkSchema.userAccountLinks.$inferSelect;
export type NewUserAccountLink =
  typeof userAccountLinkSchema.userAccountLinks.$inferInsert;

// TODO: Добавить типы для остальных моделей по мере их создания
