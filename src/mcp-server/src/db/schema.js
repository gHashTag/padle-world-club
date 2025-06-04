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
    // TODO: Добавить остальные схемы по мере создания
};
export default allSchema;
// TODO: Добавить типы для остальных моделей по мере их создания
