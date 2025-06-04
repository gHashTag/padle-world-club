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
export * from "./schema/booking";
export * from "./schema/bookingParticipant";
export * from "./schema/payment";
export * from "./schema/classDefinition";
export * from "./schema/classSchedule";
export * from "./schema/classParticipant";
export * from "./schema/trainingPackageDefinition";
export * from "./schema/userTrainingPackage";
export * from "./schema/gameSession";
export * from "./schema/gamePlayer";
export * from "./schema/ratingChange";
export * from "./schema/tournament";
export * from "./schema/tournamentParticipant";
export * from "./schema/tournamentTeam";
export * from "./schema/tournamentMatch";
export * from "./schema/productCategory";
export * from "./schema/product";
export * from "./schema/order";
export * from "./schema/task";
export * from "./schema/notification";
export * from "./schema/feedback";
export * from "./schema/stockTransaction";
export * from "./schema/bonusTransaction";
export * from "./schema/externalSystemMapping";
export * from "./schema/aiSuggestionLog";

// TODO: Импортировать остальные схемы по мере их создания
// ... и так далее

// Для удобства Drizzle Kit и некоторых сценариев импорта можно также оставить default export
// Но для генерации миграций он, похоже, не требовался или мешал.
// Для ясности можно импортировать все в объект и экспортировать его по умолчанию.
import * as enums from "./schema/enums";
import * as userSchema from "./schema/user";
import * as userAccountLinkSchema from "./schema/userAccountLink";
import * as venueSchema from "./schema/venue";
import * as courtSchema from "./schema/court";
import * as bookingSchema from "./schema/booking";
import * as bookingParticipantSchema from "./schema/bookingParticipant";
import * as paymentSchema from "./schema/payment";
import * as classDefinitionSchema from "./schema/classDefinition";
import * as classScheduleSchema from "./schema/classSchedule";
import * as classParticipantSchema from "./schema/classParticipant";
import * as trainingPackageDefinitionSchema from "./schema/trainingPackageDefinition";
import * as userTrainingPackageSchema from "./schema/userTrainingPackage";
import * as gameSessionSchema from "./schema/gameSession";
import * as gamePlayerSchema from "./schema/gamePlayer";
import * as ratingChangeSchema from "./schema/ratingChange";
import * as tournamentSchema from "./schema/tournament";
import * as tournamentParticipantSchema from "./schema/tournamentParticipant";
import * as tournamentTeamSchema from "./schema/tournamentTeam";
import * as tournamentMatchSchema from "./schema/tournamentMatch";
import * as productCategorySchema from "./schema/productCategory";
import * as productSchema from "./schema/product";
import * as orderSchema from "./schema/order";
import * as taskSchema from "./schema/task";
import * as notificationSchema from "./schema/notification";
import * as feedbackSchema from "./schema/feedback";
import * as stockTransactionSchema from "./schema/stockTransaction";
import * as bonusTransactionSchema from "./schema/bonusTransaction";
import * as externalSystemMappingSchema from "./schema/externalSystemMapping";
import * as aiSuggestionLogSchema from "./schema/aiSuggestionLog";

const allSchema = {
  ...enums,
  ...userSchema,
  ...userAccountLinkSchema,
  ...venueSchema,
  ...courtSchema,
  ...bookingSchema,
  ...bookingParticipantSchema,
  ...paymentSchema,
  ...classDefinitionSchema,
  ...classScheduleSchema,
  ...classParticipantSchema,
  ...trainingPackageDefinitionSchema,
  ...userTrainingPackageSchema,
  ...gameSessionSchema,
  ...gamePlayerSchema,
  ...ratingChangeSchema,
  ...tournamentSchema,
  ...tournamentParticipantSchema,
  ...tournamentTeamSchema,
  ...tournamentMatchSchema,
  ...productCategorySchema,
  ...productSchema,
  ...orderSchema,
  ...taskSchema,
  ...notificationSchema,
  ...feedbackSchema,
  ...stockTransactionSchema,
  ...bonusTransactionSchema,
  ...externalSystemMappingSchema,
  ...aiSuggestionLogSchema,
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

// Тип для бронирований
export type Booking = typeof bookingSchema.bookings.$inferSelect;
export type NewBooking = typeof bookingSchema.bookings.$inferInsert;

// Тип для участников бронирований
export type BookingParticipant = typeof bookingParticipantSchema.bookingParticipants.$inferSelect;
export type NewBookingParticipant = typeof bookingParticipantSchema.bookingParticipants.$inferInsert;

// Тип для платежей
export type Payment = typeof paymentSchema.payments.$inferSelect;
export type NewPayment = typeof paymentSchema.payments.$inferInsert;

// Тип для определений классов
export type ClassDefinition = typeof classDefinitionSchema.classDefinitions.$inferSelect;
export type NewClassDefinition = typeof classDefinitionSchema.classDefinitions.$inferInsert;

// Тип для расписания классов
export type ClassSchedule = typeof classScheduleSchema.classSchedules.$inferSelect;
export type NewClassSchedule = typeof classScheduleSchema.classSchedules.$inferInsert;

// Тип для участников классов
export type ClassParticipant = typeof classParticipantSchema.classParticipants.$inferSelect;
export type NewClassParticipant = typeof classParticipantSchema.classParticipants.$inferInsert;

// Тип для определений пакетов тренировок
export type TrainingPackageDefinition = typeof trainingPackageDefinitionSchema.trainingPackageDefinitions.$inferSelect;
export type NewTrainingPackageDefinition = typeof trainingPackageDefinitionSchema.trainingPackageDefinitions.$inferInsert;

// Тип для пакетов тренировок пользователей
export type UserTrainingPackage = typeof userTrainingPackageSchema.userTrainingPackages.$inferSelect;
export type NewUserTrainingPackage = typeof userTrainingPackageSchema.userTrainingPackages.$inferInsert;

// Тип для игровых сессий
export type GameSession = typeof gameSessionSchema.gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessionSchema.gameSessions.$inferInsert;

// Тип для игроков в сессиях
export type GamePlayer = typeof gamePlayerSchema.gamePlayers.$inferSelect;
export type NewGamePlayer = typeof gamePlayerSchema.gamePlayers.$inferInsert;

// Тип для изменений рейтинга
export type RatingChange = typeof ratingChangeSchema.ratingChanges.$inferSelect;
export type NewRatingChange = typeof ratingChangeSchema.ratingChanges.$inferInsert;

// Тип для турниров
export type Tournament = typeof tournamentSchema.tournaments.$inferSelect;
export type NewTournament = typeof tournamentSchema.tournaments.$inferInsert;

// Тип для участников турниров
export type TournamentParticipant = typeof tournamentParticipantSchema.tournamentParticipants.$inferSelect;
export type NewTournamentParticipant = typeof tournamentParticipantSchema.tournamentParticipants.$inferInsert;

// Тип для команд турниров
export type TournamentTeam = typeof tournamentTeamSchema.tournamentTeams.$inferSelect;
export type NewTournamentTeam = typeof tournamentTeamSchema.tournamentTeams.$inferInsert;

// Тип для матчей турниров
export type TournamentMatch = typeof tournamentMatchSchema.tournamentMatches.$inferSelect;
export type NewTournamentMatch = typeof tournamentMatchSchema.tournamentMatches.$inferInsert;

// TODO: Добавить типы для остальных моделей по мере их создания
