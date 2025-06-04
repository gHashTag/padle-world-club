/**
 * Export all schema definitions
 */

// Enums
export * from "./enums";

// User related
export * from "./user";
export * from "./userAccountLink";

// Venue related
export * from "./venue";
export * from "./court";

// Booking related
export * from "./booking";
export * from "./bookingParticipant";
export * from "./payment";

// Class related
export * from "./classDefinition";
export * from "./classSchedule";
export * from "./classParticipant";
export * from "./trainingPackageDefinition";
export * from "./userTrainingPackage";

// Game related
export * from "./gameSession";
export * from "./gamePlayer";
export * from "./ratingChange";

// Tournament related
export * from "./tournament";
export * from "./tournamentParticipant";
export * from "./tournamentTeam";
export * from "./tournamentMatch";

// Additional models
export * from "./productCategory";
export * from "./product";
export * from "./order";
export * from "./task";
export * from "./notification";
export * from "./feedback";

// Import all schemas for allSchema
import * as userSchema from "./user";
import * as userAccountLinkSchema from "./userAccountLink";
import * as venueSchema from "./venue";
import * as courtSchema from "./court";
import * as bookingSchema from "./booking";
import * as bookingParticipantSchema from "./bookingParticipant";
import * as paymentSchema from "./payment";
import * as classDefinitionSchema from "./classDefinition";
import * as classScheduleSchema from "./classSchedule";
import * as classParticipantSchema from "./classParticipant";
import * as trainingPackageDefinitionSchema from "./trainingPackageDefinition";
import * as userTrainingPackageSchema from "./userTrainingPackage";
import * as gameSessionSchema from "./gameSession";
import * as gamePlayerSchema from "./gamePlayer";
import * as ratingChangeSchema from "./ratingChange";
import * as tournamentSchema from "./tournament";
import * as tournamentParticipantSchema from "./tournamentParticipant";
import * as tournamentTeamSchema from "./tournamentTeam";
import * as tournamentMatchSchema from "./tournamentMatch";
import * as productCategorySchema from "./productCategory";
import * as productSchema from "./product";
import * as orderSchema from "./order";
import * as taskSchema from "./task";
import * as notificationSchema from "./notification";
import * as feedbackSchema from "./feedback";

// Combine all schemas
export const allSchema = {
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
};

export default allSchema;
