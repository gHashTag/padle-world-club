import { relations } from "drizzle-orm/relations";
import { venue, court, user, payment, bookingParticipant, order, tournament, bonusTransaction, booking, productCategory, product, classDefinition, classSchedule, userAccountLink, classParticipant, userTrainingPackage, trainingPackageDefinition, gameSession, gamePlayer, ratingChange, tournamentParticipant, tournamentTeam, notification, feedback, aiSuggestionLog, tournamentMatch, task, orderItem, stockTransaction } from "./schema";

export const courtRelations = relations(court, ({one, many}) => ({
	venue: one(venue, {
		fields: [court.venueId],
		references: [venue.id]
	}),
	classSchedules: many(classSchedule),
	gameSessions: many(gameSession),
	tournamentMatches: many(tournamentMatch),
	bookings: many(booking),
}));

export const venueRelations = relations(venue, ({many}) => ({
	courts: many(court),
	tournaments: many(tournament),
	classSchedules: many(classSchedule),
	gameSessions: many(gameSession),
	feedbacks: many(feedback),
	tasks: many(task),
}));

export const paymentRelations = relations(payment, ({one, many}) => ({
	user: one(user, {
		fields: [payment.userId],
		references: [user.id]
	}),
	bookingParticipant: one(bookingParticipant, {
		fields: [payment.relatedBookingParticipantId],
		references: [bookingParticipant.id]
	}),
	orders: many(order),
}));

export const userRelations = relations(user, ({many}) => ({
	payments: many(payment),
	orders: many(order),
	bonusTransactions: many(bonusTransaction),
	classSchedules: many(classSchedule),
	userAccountLinks: many(userAccountLink),
	classParticipants: many(classParticipant),
	userTrainingPackages: many(userTrainingPackage),
	gameSessions_createdByUserId: many(gameSession, {
		relationName: "gameSession_createdByUserId_user_id"
	}),
	gameSessions_hostUserId: many(gameSession, {
		relationName: "gameSession_hostUserId_user_id"
	}),
	gamePlayers: many(gamePlayer),
	ratingChanges: many(ratingChange),
	tournamentParticipants_userId: many(tournamentParticipant, {
		relationName: "tournamentParticipant_userId_user_id"
	}),
	tournamentParticipants_partnerUserId: many(tournamentParticipant, {
		relationName: "tournamentParticipant_partnerUserId_user_id"
	}),
	notifications: many(notification),
	feedbacks_userId: many(feedback, {
		relationName: "feedback_userId_user_id"
	}),
	feedbacks_resolvedByUserId: many(feedback, {
		relationName: "feedback_resolvedByUserId_user_id"
	}),
	aiSuggestionLogs: many(aiSuggestionLog),
	bookings: many(booking),
	bookingParticipants: many(bookingParticipant),
	tournamentTeams_player1Id: many(tournamentTeam, {
		relationName: "tournamentTeam_player1Id_user_id"
	}),
	tournamentTeams_player2Id: many(tournamentTeam, {
		relationName: "tournamentTeam_player2Id_user_id"
	}),
	tasks_assignedToUserId: many(task, {
		relationName: "task_assignedToUserId_user_id"
	}),
	tasks_createdByUserId: many(task, {
		relationName: "task_createdByUserId_user_id"
	}),
}));

export const bookingParticipantRelations = relations(bookingParticipant, ({one, many}) => ({
	payments: many(payment),
	booking: one(booking, {
		fields: [bookingParticipant.bookingId],
		references: [booking.id]
	}),
	user: one(user, {
		fields: [bookingParticipant.userId],
		references: [user.id]
	}),
}));

export const orderRelations = relations(order, ({one, many}) => ({
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
	payment: one(payment, {
		fields: [order.paymentId],
		references: [payment.id]
	}),
	bonusTransactions: many(bonusTransaction),
	orderItems: many(orderItem),
}));

export const tournamentRelations = relations(tournament, ({one, many}) => ({
	venue: one(venue, {
		fields: [tournament.venueId],
		references: [venue.id]
	}),
	tournamentParticipants: many(tournamentParticipant),
	tournamentMatches: many(tournamentMatch),
	tournamentTeams: many(tournamentTeam),
}));

export const bonusTransactionRelations = relations(bonusTransaction, ({one}) => ({
	user: one(user, {
		fields: [bonusTransaction.userId],
		references: [user.id]
	}),
	order: one(order, {
		fields: [bonusTransaction.relatedOrderId],
		references: [order.id]
	}),
	booking: one(booking, {
		fields: [bonusTransaction.relatedBookingId],
		references: [booking.id]
	}),
}));

export const bookingRelations = relations(booking, ({one, many}) => ({
	bonusTransactions: many(bonusTransaction),
	classSchedules: many(classSchedule),
	gameSessions: many(gameSession),
	court: one(court, {
		fields: [booking.courtId],
		references: [court.id]
	}),
	user: one(user, {
		fields: [booking.bookedByUserId],
		references: [user.id]
	}),
	bookingParticipants: many(bookingParticipant),
}));

export const productRelations = relations(product, ({one, many}) => ({
	productCategory: one(productCategory, {
		fields: [product.categoryId],
		references: [productCategory.id]
	}),
	orderItems: many(orderItem),
	stockTransactions: many(stockTransaction),
}));

export const productCategoryRelations = relations(productCategory, ({many}) => ({
	products: many(product),
}));

export const classScheduleRelations = relations(classSchedule, ({one, many}) => ({
	classDefinition: one(classDefinition, {
		fields: [classSchedule.classDefinitionId],
		references: [classDefinition.id]
	}),
	venue: one(venue, {
		fields: [classSchedule.venueId],
		references: [venue.id]
	}),
	user: one(user, {
		fields: [classSchedule.instructorId],
		references: [user.id]
	}),
	court: one(court, {
		fields: [classSchedule.courtId],
		references: [court.id]
	}),
	booking: one(booking, {
		fields: [classSchedule.relatedBookingId],
		references: [booking.id]
	}),
	classParticipants: many(classParticipant),
}));

export const classDefinitionRelations = relations(classDefinition, ({many}) => ({
	classSchedules: many(classSchedule),
}));

export const userAccountLinkRelations = relations(userAccountLink, ({one}) => ({
	user: one(user, {
		fields: [userAccountLink.userId],
		references: [user.id]
	}),
}));

export const classParticipantRelations = relations(classParticipant, ({one}) => ({
	classSchedule: one(classSchedule, {
		fields: [classParticipant.classScheduleId],
		references: [classSchedule.id]
	}),
	user: one(user, {
		fields: [classParticipant.userId],
		references: [user.id]
	}),
}));

export const userTrainingPackageRelations = relations(userTrainingPackage, ({one}) => ({
	user: one(user, {
		fields: [userTrainingPackage.userId],
		references: [user.id]
	}),
	trainingPackageDefinition: one(trainingPackageDefinition, {
		fields: [userTrainingPackage.packageDefinitionId],
		references: [trainingPackageDefinition.id]
	}),
}));

export const trainingPackageDefinitionRelations = relations(trainingPackageDefinition, ({many}) => ({
	userTrainingPackages: many(userTrainingPackage),
}));

export const gameSessionRelations = relations(gameSession, ({one, many}) => ({
	venue: one(venue, {
		fields: [gameSession.venueId],
		references: [venue.id]
	}),
	court: one(court, {
		fields: [gameSession.courtId],
		references: [court.id]
	}),
	user_createdByUserId: one(user, {
		fields: [gameSession.createdByUserId],
		references: [user.id],
		relationName: "gameSession_createdByUserId_user_id"
	}),
	user_hostUserId: one(user, {
		fields: [gameSession.hostUserId],
		references: [user.id],
		relationName: "gameSession_hostUserId_user_id"
	}),
	booking: one(booking, {
		fields: [gameSession.relatedBookingId],
		references: [booking.id]
	}),
	gamePlayers: many(gamePlayer),
	ratingChanges: many(ratingChange),
}));

export const gamePlayerRelations = relations(gamePlayer, ({one}) => ({
	gameSession: one(gameSession, {
		fields: [gamePlayer.gameSessionId],
		references: [gameSession.id]
	}),
	user: one(user, {
		fields: [gamePlayer.userId],
		references: [user.id]
	}),
}));

export const ratingChangeRelations = relations(ratingChange, ({one}) => ({
	user: one(user, {
		fields: [ratingChange.userId],
		references: [user.id]
	}),
	gameSession: one(gameSession, {
		fields: [ratingChange.relatedGameSessionId],
		references: [gameSession.id]
	}),
}));

export const tournamentParticipantRelations = relations(tournamentParticipant, ({one}) => ({
	tournament: one(tournament, {
		fields: [tournamentParticipant.tournamentId],
		references: [tournament.id]
	}),
	user_userId: one(user, {
		fields: [tournamentParticipant.userId],
		references: [user.id],
		relationName: "tournamentParticipant_userId_user_id"
	}),
	user_partnerUserId: one(user, {
		fields: [tournamentParticipant.partnerUserId],
		references: [user.id],
		relationName: "tournamentParticipant_partnerUserId_user_id"
	}),
	tournamentTeam: one(tournamentTeam, {
		fields: [tournamentParticipant.teamId],
		references: [tournamentTeam.id]
	}),
}));

export const tournamentTeamRelations = relations(tournamentTeam, ({one, many}) => ({
	tournamentParticipants: many(tournamentParticipant),
	tournamentMatches_winnerTeamId: many(tournamentMatch, {
		relationName: "tournamentMatch_winnerTeamId_tournamentTeam_id"
	}),
	tournamentMatches_loserTeamId: many(tournamentMatch, {
		relationName: "tournamentMatch_loserTeamId_tournamentTeam_id"
	}),
	tournament: one(tournament, {
		fields: [tournamentTeam.tournamentId],
		references: [tournament.id]
	}),
	user_player1Id: one(user, {
		fields: [tournamentTeam.player1Id],
		references: [user.id],
		relationName: "tournamentTeam_player1Id_user_id"
	}),
	user_player2Id: one(user, {
		fields: [tournamentTeam.player2Id],
		references: [user.id],
		relationName: "tournamentTeam_player2Id_user_id"
	}),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const feedbackRelations = relations(feedback, ({one}) => ({
	user_userId: one(user, {
		fields: [feedback.userId],
		references: [user.id],
		relationName: "feedback_userId_user_id"
	}),
	venue: one(venue, {
		fields: [feedback.venueId],
		references: [venue.id]
	}),
	user_resolvedByUserId: one(user, {
		fields: [feedback.resolvedByUserId],
		references: [user.id],
		relationName: "feedback_resolvedByUserId_user_id"
	}),
}));

export const aiSuggestionLogRelations = relations(aiSuggestionLog, ({one}) => ({
	user: one(user, {
		fields: [aiSuggestionLog.userId],
		references: [user.id]
	}),
}));

export const tournamentMatchRelations = relations(tournamentMatch, ({one}) => ({
	tournament: one(tournament, {
		fields: [tournamentMatch.tournamentId],
		references: [tournament.id]
	}),
	court: one(court, {
		fields: [tournamentMatch.courtId],
		references: [court.id]
	}),
	tournamentTeam_winnerTeamId: one(tournamentTeam, {
		fields: [tournamentMatch.winnerTeamId],
		references: [tournamentTeam.id],
		relationName: "tournamentMatch_winnerTeamId_tournamentTeam_id"
	}),
	tournamentTeam_loserTeamId: one(tournamentTeam, {
		fields: [tournamentMatch.loserTeamId],
		references: [tournamentTeam.id],
		relationName: "tournamentMatch_loserTeamId_tournamentTeam_id"
	}),
}));

export const taskRelations = relations(task, ({one}) => ({
	user_assignedToUserId: one(user, {
		fields: [task.assignedToUserId],
		references: [user.id],
		relationName: "task_assignedToUserId_user_id"
	}),
	user_createdByUserId: one(user, {
		fields: [task.createdByUserId],
		references: [user.id],
		relationName: "task_createdByUserId_user_id"
	}),
	venue: one(venue, {
		fields: [task.venueId],
		references: [venue.id]
	}),
}));

export const orderItemRelations = relations(orderItem, ({one, many}) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id]
	}),
	product: one(product, {
		fields: [orderItem.productId],
		references: [product.id]
	}),
	stockTransactions: many(stockTransaction),
}));

export const stockTransactionRelations = relations(stockTransaction, ({one}) => ({
	product: one(product, {
		fields: [stockTransaction.productId],
		references: [product.id]
	}),
	orderItem: one(orderItem, {
		fields: [stockTransaction.relatedOrderItemId],
		references: [orderItem.id]
	}),
}));