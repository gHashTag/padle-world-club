/**
 * Схема базы данных Drizzle ORM для Padel World Club
 * Этот файл является точкой входа для всех схем таблиц.
 */

// Напрямую экспортируем константы таблиц и перечислений
export * from "./schema/enums";
export * from "./schema/user";
export * from "./schema/userAccountLink";
export * from "./schema/venue";
export * from "./schema/court";

// TODO: Импортировать остальные схемы по мере их создания
// export * from "./schema/booking";
// export * from "./schema/payment";
// ... и так далее

// Для удобства Drizzle Kit и некоторых сценариев импорта можно также оставить default export
// Но для генерации миграций он, похоже, не требовался или мешал.
// Для ясности можно импортировать все в объект и экспортировать его по умолчанию.
import * as enums from "./schema/enums";
import * as userSchema from "./schema/user";
import * as userAccountLinkSchema from "./schema/userAccountLink";
import * as venueSchema from "./schema/venue";
import * as courtSchema from "./schema/court";

const allSchema = {
  ...enums,
  ...userSchema,
  ...userAccountLinkSchema,
  ...venueSchema,
  ...courtSchema,
  // TODO: Добавить остальные схемы по мере создания
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

// Тип для клубов/площадок
export type Venue = typeof venueSchema.venues.$inferSelect;
export type NewVenue = typeof venueSchema.venues.$inferInsert;

// Тип для кортов
export type Court = typeof courtSchema.courts.$inferSelect;
export type NewCourt = typeof courtSchema.courts.$inferInsert;

// TODO: Добавить типы для остальных моделей по мере их создания
