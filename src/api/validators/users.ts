/**
 * Валидаторы для пользователей (User и UserAccountLink)
 */

import { z } from 'zod';
import { commonSchemas, paginationSchemas, sortingSchemas, searchSchemas } from './common';

// Enum валидаторы на основе схемы базы данных
export const userEnums = {
  userRole: z.enum(['player', 'coach', 'club_staff', 'admin']),
  gender: z.enum(['male', 'female', 'other', 'unknown']),
  notificationChannel: z.enum(['whatsapp', 'telegram', 'email', 'app_push']),
};

// Базовая схема пользователя (полная)
export const userSchema = z.object({
  id: commonSchemas.uuid,
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(255, 'Имя пользователя не должно превышать 255 символов')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания'
    ),
  passwordHash: z.string()
    .min(1, 'Хеш пароля обязателен')
    .max(255, 'Хеш пароля не должен превышать 255 символов'),
  firstName: commonSchemas.name,
  lastName: commonSchemas.name,
  email: commonSchemas.email,
  phone: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Неверный формат телефона (минимум 7 цифр)')
    .max(50, 'Телефон не должен превышать 50 символов')
    .optional()
    .nullable(),
  memberId: z.string()
    .min(1, 'ID участника обязателен')
    .max(50, 'ID участника не должен превышать 50 символов'),
  userRole: userEnums.userRole,
  currentRating: z.number()
    .min(0, 'Рейтинг не может быть отрицательным')
    .max(5000, 'Рейтинг не может превышать 5000')
    .default(1500),
  bonusPoints: z.number()
    .int('Бонусные очки должны быть целым числом')
    .min(0, 'Бонусные очки не могут быть отрицательными')
    .default(0),
  profileImageUrl: commonSchemas.url.nullable(),
  gender: userEnums.gender.optional().nullable(),
  dateOfBirth: commonSchemas.dateOnly.optional().nullable(),
  homeVenueId: commonSchemas.uuid.optional().nullable(),
  isAccountVerified: z.boolean().default(false),
  lastLoginAt: commonSchemas.dateString.optional().nullable(),
  lastActivityAt: commonSchemas.dateString.optional().nullable(),
  createdAt: commonSchemas.dateString,
  updatedAt: commonSchemas.dateString,
});

// Базовая схема для создания пользователя (без системных полей)
const createUserBaseSchema = z.object({
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(255, 'Имя пользователя не должно превышать 255 символов')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания'
    ),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать строчные, заглавные буквы и цифры'
    ),
  firstName: commonSchemas.name,
  lastName: commonSchemas.name,
  email: commonSchemas.email,
  phone: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Неверный формат телефона (минимум 7 цифр)')
    .max(50, 'Телефон не должен превышать 50 символов')
    .optional()
    .nullable(),
  memberId: z.string()
    .min(1, 'ID участника обязателен')
    .max(50, 'ID участника не должен превышать 50 символов'),
  userRole: userEnums.userRole,
  currentRating: z.number()
    .min(0, 'Рейтинг не может быть отрицательным')
    .max(5000, 'Рейтинг не может превышать 5000')
    .default(1500),
  bonusPoints: z.number()
    .int('Бонусные очки должны быть целым числом')
    .min(0, 'Бонусные очки не могут быть отрицательными')
    .default(0),
  profileImageUrl: commonSchemas.url.nullable(),
  gender: userEnums.gender.optional().nullable(),
  dateOfBirth: commonSchemas.dateOnly.optional().nullable(),
  homeVenueId: commonSchemas.uuid.optional().nullable(),
  isAccountVerified: z.boolean().default(false),
});

// Схема для создания пользователя
export const createUserSchema = createUserBaseSchema;

// Базовая схема для обновления пользователя (без системных полей)
const updateUserBaseSchema = z.object({
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(255, 'Имя пользователя не должно превышать 255 символов')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания'
    ),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать строчные, заглавные буквы и цифры'
    ),
  firstName: commonSchemas.name,
  lastName: commonSchemas.name,
  email: commonSchemas.email,
  phone: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Неверный формат телефона (минимум 7 цифр)')
    .max(50, 'Телефон не должен превышать 50 символов')
    .nullable(),
  memberId: z.string()
    .min(1, 'ID участника обязателен')
    .max(50, 'ID участника не должен превышать 50 символов'),
  userRole: userEnums.userRole,
  currentRating: z.number()
    .min(0, 'Рейтинг не может быть отрицательным')
    .max(5000, 'Рейтинг не может превышать 5000'),
  bonusPoints: z.number()
    .int('Бонусные очки должны быть целым числом')
    .min(0, 'Бонусные очки не могут быть отрицательными'),
  profileImageUrl: commonSchemas.url.nullable(),
  gender: userEnums.gender.nullable(),
  dateOfBirth: commonSchemas.dateOnly.nullable(),
  homeVenueId: commonSchemas.uuid.nullable(),
  isAccountVerified: z.boolean(),
}).partial();

// Схема для обновления пользователя
export const updateUserSchema = updateUserBaseSchema;

// Схема для входа в систему
export const loginSchema = z.object({
  username: z.string().min(1, 'Имя пользователя обязательно'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// Схема для смены пароля
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
  newPassword: z.string()
    .min(8, 'Новый пароль должен содержать минимум 8 символов')
    .max(128, 'Новый пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Новый пароль должен содержать строчные, заглавные буквы и цифры'
    ),
  confirmPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
);

// Схема для сброса пароля
export const resetPasswordSchema = z.object({
  email: commonSchemas.email,
});

// Схема для подтверждения сброса пароля
export const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
  newPassword: z.string()
    .min(8, 'Новый пароль должен содержать минимум 8 символов')
    .max(128, 'Новый пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Новый пароль должен содержать строчные, заглавные буквы и цифры'
    ),
  confirmPassword: z.string(),
}).refine(
  data => data.newPassword === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
);

// Схема для поиска пользователей
export const searchUsersSchema = z.object({
  ...paginationSchemas.basic.shape,
  ...sortingSchemas.withFields([
    'username', 'firstName', 'lastName', 'email', 'currentRating',
    'createdAt', 'updatedAt', 'lastLoginAt'
  ]).shape,
  ...searchSchemas.basic.shape,

  // Фильтры
  userRole: userEnums.userRole.optional(),
  gender: userEnums.gender.optional(),
  isAccountVerified: z.boolean().optional(),
  minRating: z.number().min(0).max(5000).optional(),
  maxRating: z.number().min(0).max(5000).optional(),
  homeVenueId: commonSchemas.uuid.optional(),

  // Диапазон дат
  createdAfter: commonSchemas.dateString.optional(),
  createdBefore: commonSchemas.dateString.optional(),
  lastLoginAfter: commonSchemas.dateString.optional(),
  lastLoginBefore: commonSchemas.dateString.optional(),
}).refine(
  data => !data.minRating || !data.maxRating || data.minRating <= data.maxRating,
  {
    message: 'Минимальный рейтинг должен быть меньше максимального',
    path: ['maxRating'],
  }
).refine(
  data => !data.createdAfter || !data.createdBefore ||
    new Date(data.createdAfter) <= new Date(data.createdBefore),
  {
    message: 'Дата начала должна быть меньше даты окончания',
    path: ['createdBefore'],
  }
);

// Схема для обновления профиля пользователя (без административных полей)
export const updateProfileSchema = updateUserSchema.omit({
  userRole: true,
  memberId: true,
  bonusPoints: true,
  currentRating: true,
  isAccountVerified: true,
  homeVenueId: true,
});

// Схема для получения статистики пользователя
export const userStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: commonSchemas.dateString.optional(),
  endDate: commonSchemas.dateString.optional(),
});

// ===== СХЕМЫ ДЛЯ USER ACCOUNT LINK =====

// Базовая схема связи аккаунта пользователя
export const userAccountLinkSchema = z.object({
  id: commonSchemas.uuid,
  userId: commonSchemas.uuid,
  platform: userEnums.notificationChannel,
  platformUserId: z.string()
    .min(1, 'ID пользователя на платформе обязателен')
    .max(255, 'ID пользователя на платформе не должен превышать 255 символов'),
  isPrimary: z.boolean().default(false),
  createdAt: commonSchemas.dateString,
  updatedAt: commonSchemas.dateString,
});

// Схема для создания связи аккаунта
export const createUserAccountLinkSchema = userAccountLinkSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Схема для обновления связи аккаунта
export const updateUserAccountLinkSchema = userAccountLinkSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Схема для поиска связей аккаунтов
export const searchUserAccountLinksSchema = z.object({
  ...paginationSchemas.basic.shape,
  ...sortingSchemas.withFields(['platform', 'isPrimary', 'createdAt', 'updatedAt']).shape,

  // Фильтры
  userId: commonSchemas.uuid.optional(),
  platform: userEnums.notificationChannel.optional(),
  isPrimary: z.boolean().optional(),
  platformUserId: z.string().optional(),

  // Диапазон дат
  createdAfter: commonSchemas.dateString.optional(),
  createdBefore: commonSchemas.dateString.optional(),
}).refine(
  data => !data.createdAfter || !data.createdBefore ||
    new Date(data.createdAfter) <= new Date(data.createdBefore),
  {
    message: 'Дата начала должна быть меньше даты окончания',
    path: ['createdBefore'],
  }
);

// Схема для установки основной связи
export const setPrimaryAccountLinkSchema = z.object({
  userId: commonSchemas.uuid,
  accountLinkId: commonSchemas.uuid,
});

// ===== ПАРАМЕТРЫ URL =====

// Параметры для пользователя
export const userParamsSchema = z.object({
  userId: commonSchemas.uuid,
});

// Параметры для связи аккаунта
export const accountLinkParamsSchema = z.object({
  userId: commonSchemas.uuid,
  linkId: commonSchemas.uuid,
});

// ===== ЭКСПОРТ ВСЕХ ВАЛИДАТОРОВ =====

export const UserValidators = {
  // Основные схемы пользователя
  user: userSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  updateProfile: updateProfileSchema,
  searchUsers: searchUsersSchema,
  userStats: userStatsSchema,

  // Аутентификация
  login: loginSchema,
  changePassword: changePasswordSchema,
  resetPassword: resetPasswordSchema,
  confirmResetPassword: confirmResetPasswordSchema,

  // Связи аккаунтов
  userAccountLink: userAccountLinkSchema,
  createUserAccountLink: createUserAccountLinkSchema,
  updateUserAccountLink: updateUserAccountLinkSchema,
  searchUserAccountLinks: searchUserAccountLinksSchema,
  setPrimaryAccountLink: setPrimaryAccountLinkSchema,

  // Параметры URL
  userParams: userParamsSchema,
  accountLinkParams: accountLinkParamsSchema,

  // Enum'ы
  enums: userEnums,
};
