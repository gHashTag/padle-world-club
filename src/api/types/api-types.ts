/**
 * Специфичные типы для API endpoints
 */

// Типы для Users API
export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userRole?: 'admin' | 'coach' | 'player' | 'guest';
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  preferredNotificationChannels?: ('email' | 'sms' | 'push' | 'telegram')[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  isAccountVerified?: boolean;
  currentRating?: number;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userRole: string;
  skillLevel?: string;
  gender?: string;
  dateOfBirth?: string;
  currentRating: number;
  isAccountVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Типы для Venues API
export interface CreateVenueRequest {
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  amenities?: string[];
  operatingHours?: Record<string, { open: string; close: string }>;
  parkingAvailable?: boolean;
  accessibilityFeatures?: string[];
}

export interface UpdateVenueRequest extends Partial<CreateVenueRequest> {}

export interface VenueResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  amenities?: string[];
  operatingHours?: Record<string, any>;
  parkingAvailable: boolean;
  accessibilityFeatures?: string[];
  createdAt: string;
  updatedAt: string;
}

// Типы для Courts API
export interface CreateCourtRequest {
  venueId: string;
  name: string;
  courtType: 'tennis' | 'paddle' | 'squash' | 'badminton' | 'other';
  surface?: 'clay' | 'grass' | 'hard' | 'artificial_grass' | 'other';
  isIndoor: boolean;
  hourlyRate: number;
  currency: string;
  isActive?: boolean;
  maintenanceNotes?: string;
  equipment?: string[];
}

export interface UpdateCourtRequest extends Partial<CreateCourtRequest> {}

export interface CourtResponse {
  id: string;
  venueId: string;
  name: string;
  courtType: string;
  surface?: string;
  isIndoor: boolean;
  hourlyRate: number;
  currency: string;
  isActive: boolean;
  maintenanceNotes?: string;
  equipment?: string[];
  createdAt: string;
  updatedAt: string;
  venue?: VenueResponse;
}

// Типы для Bookings API
export interface CreateBookingRequest {
  courtId: string;
  userId: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  currency: string;
  notes?: string;
  participants?: string[]; // user IDs
}

export interface UpdateBookingRequest {
  startTime?: string;
  endTime?: string;
  status?: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface BookingResponse {
  id: string;
  courtId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  court?: CourtResponse;
  user?: UserResponse;
  participants?: UserResponse[];
}

// Типы для Payments API
export interface CreatePaymentRequest {
  bookingId?: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet';
  description?: string;
}

export interface UpdatePaymentRequest {
  status?: 'pending' | 'success' | 'failed' | 'refunded';
  transactionId?: string;
  failureReason?: string;
}

export interface PaymentResponse {
  id: string;
  bookingId?: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  description?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  booking?: BookingResponse;
  user?: UserResponse;
}

// Типы для Tournaments API
export interface CreateTournamentRequest {
  name: string;
  description?: string;
  venueId: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  tournamentType: 'singles_elimination' | 'doubles_round_robin' | 'other';
  skillLevelCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  registrationFee: number;
  currency: string;
  prizePool?: number;
  rules?: string;
}

export interface UpdateTournamentRequest extends Partial<CreateTournamentRequest> {
  status?: 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
}

export interface TournamentResponse {
  id: string;
  name: string;
  description?: string;
  venueId: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  tournamentType: string;
  skillLevelCategory: string;
  registrationFee: number;
  currency: string;
  prizePool?: number;
  rules?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  venue?: VenueResponse;
  participantsCount?: number;
}

// Типы для Game Sessions API
export interface CreateGameSessionRequest {
  courtId: string;
  organizerId: string;
  scheduledStartTime: string;
  estimatedDuration: number;
  maxPlayers: number;
  skillLevelRequired?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  isRanked?: boolean;
  description?: string;
  entryFee?: number;
  currency?: string;
}

export interface UpdateGameSessionRequest extends Partial<CreateGameSessionRequest> {
  status?: 'open_for_players' | 'full' | 'in_progress' | 'completed' | 'cancelled';
  actualStartTime?: string;
  actualEndTime?: string;
}

export interface GameSessionResponse {
  id: string;
  courtId: string;
  organizerId: string;
  scheduledStartTime: string;
  estimatedDuration: number;
  maxPlayers: number;
  skillLevelRequired?: string;
  isRanked: boolean;
  description?: string;
  entryFee?: number;
  currency?: string;
  status: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
  court?: CourtResponse;
  organizer?: UserResponse;
  players?: UserResponse[];
  playersCount?: number;
}
