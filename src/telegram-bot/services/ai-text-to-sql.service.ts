/**
 * AI-Powered Text-to-SQL Service
 * Использует AI SDK для преобразования естественного языка в SQL запросы
 */

import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "../../db/schema";

// Схема для структурированного ответа AI
const SQLQuerySchema = z.object({
  sql: z.string().describe("SQL запрос для выполнения"),
  explanation: z.string().describe("Объяснение что делает запрос"),
  confidence: z.number().min(0).max(1).describe("Уверенность в правильности запроса (0-1)"),
  tables: z.array(z.string()).describe("Список таблиц, используемых в запросе"),
  safety: z.object({
    isReadOnly: z.boolean().describe("Является ли запрос только для чтения"),
    hasLimit: z.boolean().describe("Есть ли ограничение LIMIT в запросе"),
    riskLevel: z.enum(['low', 'medium', 'high']).describe("Уровень риска запроса")
  })
});

export interface AITextToSQLResult {
  success: boolean;
  sql?: string;
  explanation?: string;
  confidence?: number;
  tables?: string[];
  safety?: {
    isReadOnly: boolean;
    hasLimit: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
  error?: string;
}

export interface QueryExecutionResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
  executionTime?: number;
}

export class AITextToSQLService {
  private db: PostgresJsDatabase<typeof schema>;
  private model = openai('gpt-4o-mini'); // Используем быструю модель для SQL генерации

  // Схема базы данных для контекста AI
  private readonly databaseSchema = `
-- СХЕМА БАЗЫ ДАННЫХ PADLE WORLD CLUB

-- Пользователи системы
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  member_id VARCHAR(50) UNIQUE NOT NULL,
  user_role user_role NOT NULL DEFAULT 'player', -- 'player', 'coach', 'club_staff', 'admin'
  current_rating DECIMAL(10,2) NOT NULL DEFAULT 1500.00,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  profile_image_url TEXT,
  gender gender_type, -- 'male', 'female', 'other', 'unknown'
  date_of_birth TIMESTAMP,
  home_venue_id UUID,
  is_account_verified BOOLEAN NOT NULL DEFAULT false,
  last_login_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Спортивные площадки
CREATE TABLE venues (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  website TEXT,
  working_hours VARCHAR(255),
  amenities TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Корты
CREATE TABLE courts (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  court_type court_type NOT NULL, -- 'paddle', 'tennis'
  hourly_rate DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Бронирования
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending_payment', -- 'confirmed', 'pending_payment', 'cancelled', 'completed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Участники бронирований
CREATE TABLE booking_participants (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'player',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Платежи
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method NOT NULL, -- 'card', 'cash', 'bank_transfer', 'bonus_points'
  status payment_status NOT NULL DEFAULT 'pending', -- 'success', 'failed', 'pending', 'refunded', 'partial'
  transaction_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Игровые сессии
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  game_type game_type NOT NULL, -- 'public_match', 'private_match'
  skill_level user_skill_level, -- 'beginner', 'intermediate', 'advanced', 'professional'
  max_players INTEGER NOT NULL DEFAULT 4,
  current_players INTEGER NOT NULL DEFAULT 0,
  status game_session_status NOT NULL DEFAULT 'open_for_players', -- 'open_for_players', 'full', 'in_progress', 'completed', 'cancelled'
  is_ranked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Игроки в сессиях
CREATE TABLE game_players (
  id UUID PRIMARY KEY,
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team VARCHAR(50),
  position VARCHAR(50),
  score INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Изменения рейтинга
CREATE TABLE rating_changes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  old_rating DECIMAL(10,2) NOT NULL,
  new_rating DECIMAL(10,2) NOT NULL,
  rating_change DECIMAL(10,2) NOT NULL,
  reason rating_change_reason NOT NULL, -- 'game_session', 'tournament_match', 'manual_adjustment'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Турниры
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER NOT NULL DEFAULT 0,
  entry_fee DECIMAL(10,2),
  prize_pool DECIMAL(10,2),
  tournament_type tournament_type NOT NULL, -- 'singles_elimination', 'doubles_round_robin', 'other'
  skill_level user_skill_level, -- 'beginner', 'intermediate', 'advanced', 'professional'
  status tournament_status NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'
  rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Участники турниров
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status tournament_participant_status NOT NULL DEFAULT 'registered' -- 'registered', 'checked_in', 'withdrawn'
);

-- Уведомления
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Задачи
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Отзывы
CREATE TABLE feedback (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
  `;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Преобразует текст на естественном языке в SQL запрос с помощью AI
   */
  async convertToSQL(userQuery: string): Promise<AITextToSQLResult> {
    try {
      const systemPrompt = `Ты эксперт по SQL и базам данных. Твоя задача - преобразовать запросы на русском языке в безопасные SQL запросы для базы данных паддл-клуба.

ВАЖНЫЕ ПРАВИЛА БЕЗОПАСНОСТИ:
1. ТОЛЬКО SELECT запросы - никаких INSERT, UPDATE, DELETE, DROP и т.д.
2. Всегда добавляй LIMIT если его нет (максимум 100 записей)
3. Используй только существующие таблицы и колонки из схемы
4. Проверяй типы данных и enum значения
5. Избегай потенциально опасных конструкций

СХЕМА БАЗЫ ДАННЫХ:
${this.databaseSchema}

ПРИМЕРЫ ПЕРЕВОДОВ:
- "пользователи" → users
- "игроки" → users (WHERE user_role = 'player')
- "корты" → courts
- "бронирования" → bookings
- "турниры" → tournaments
- "рейтинг" → current_rating
- "топ 10" → ORDER BY ... DESC LIMIT 10
- "сегодня" → DATE(created_at) = CURRENT_DATE
- "последние" → ORDER BY created_at DESC

Отвечай структурированным JSON объектом с SQL запросом, объяснением и оценкой безопасности.`;

      const result = await generateObject({
        model: this.model,
        system: systemPrompt,
        prompt: `Преобразуй этот запрос в SQL: "${userQuery}"`,
        schema: SQLQuerySchema,
        temperature: 0.1, // Низкая температура для более предсказуемых результатов
      });

      // Дополнительная проверка безопасности
      const safetyCheck = this.validateSQLSafety(result.object.sql);

      if (!safetyCheck.isValid) {
        return {
          success: false,
          error: `Небезопасный запрос: ${safetyCheck.reason}`
        };
      }

      return {
        success: true,
        sql: result.object.sql,
        explanation: result.object.explanation,
        confidence: result.object.confidence,
        tables: result.object.tables,
        safety: result.object.safety
      };

    } catch (error) {
      console.error('AI Text-to-SQL error:', error);
      return {
        success: false,
        error: `Ошибка AI обработки: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Выполняет SQL запрос с мониторингом производительности
   */
  async executeQuery(sqlQuery: string): Promise<QueryExecutionResult> {
    const startTime = Date.now();

    try {
      // Дополнительная проверка безопасности перед выполнением
      const safetyCheck = this.validateSQLSafety(sqlQuery);
      if (!safetyCheck.isValid) {
        return {
          success: false,
          error: `Запрос заблокирован: ${safetyCheck.reason}`
        };
      }

      // Добавляем LIMIT если его нет
      let finalQuery = sqlQuery.trim();
      if (!finalQuery.toLowerCase().includes('limit')) {
        finalQuery += ' LIMIT 100';
      }

      const result = await this.db.execute(sql.raw(finalQuery));
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result as any[],
        rowCount: result.length,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('SQL execution error:', error);

      return {
        success: false,
        error: `Ошибка выполнения SQL: ${error instanceof Error ? error.message : String(error)}`,
        executionTime
      };
    }
  }

  /**
   * Форматирует результат с помощью AI для лучшего представления
   */
  async formatResultWithAI(originalQuery: string, sqlQuery: string, data: any[]): Promise<string> {
    try {
      if (data.length === 0) {
        return `🔍 **Запрос:** ${originalQuery}\n\n📭 Данные не найдены`;
      }

      const formatPrompt = `Отформатируй результат SQL запроса для пользователя на русском языке.

ИСХОДНЫЙ ЗАПРОС: "${originalQuery}"
SQL ЗАПРОС: ${sqlQuery}
КОЛИЧЕСТВО ЗАПИСЕЙ: ${data.length}

ДАННЫЕ (первые 3 записи):
${JSON.stringify(data.slice(0, 3), null, 2)}

Создай красивый, понятный ответ с:
1. Кратким описанием что найдено
2. Основными результатами в удобном формате
3. Эмодзи для лучшего восприятия
4. Если данных много - покажи только ключевые поля

Формат ответа: Markdown с эмодзи.`;

      const result = await generateText({
        model: this.model,
        prompt: formatPrompt,
        temperature: 0.3,
        maxTokens: 1000
      });

      return result.text + `\n\n🔧 **SQL:** \`${sqlQuery}\``;

    } catch (error) {
      console.error('AI formatting error:', error);
      // Fallback к простому форматированию
      return this.formatResultSimple(originalQuery, sqlQuery, data);
    }
  }

  /**
   * Простое форматирование результата (fallback)
   */
  private formatResultSimple(originalQuery: string, sqlQuery: string, data: any[]): string {
    let result = `🔍 **Запрос:** ${originalQuery}\n\n`;
    result += `📊 **Найдено записей:** ${data.length}\n\n`;

    // Показываем первые 5 записей
    const displayData = data.slice(0, 5);

    for (let i = 0; i < displayData.length; i++) {
      const record = displayData[i];
      result += `**${i + 1}.** `;

      // Показываем основные поля
      const mainFields = Object.entries(record)
        .slice(0, 3)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' • ');

      result += mainFields + '\n';
    }

    if (data.length > 5) {
      result += `\n... и еще ${data.length - 5} записей`;
    }

    result += `\n\n🔧 **SQL:** \`${sqlQuery}\``;

    return result;
  }

  /**
   * Проверяет безопасность SQL запроса
   */
  private validateSQLSafety(sqlQuery: string): { isValid: boolean; reason?: string } {
    const lowerQuery = sqlQuery.toLowerCase().trim();

    // Проверяем что это SELECT запрос
    if (!lowerQuery.startsWith('select')) {
      return { isValid: false, reason: 'Разрешены только SELECT запросы' };
    }

    // Запрещенные операции
    const forbiddenKeywords = [
      'insert', 'update', 'delete', 'drop', 'create', 'alter',
      'truncate', 'grant', 'revoke', 'exec', 'execute',
      'sp_', 'xp_', '--', '/*', '*/', ';'
    ];

    for (const keyword of forbiddenKeywords) {
      if (lowerQuery.includes(keyword)) {
        return { isValid: false, reason: `Запрещенная операция: ${keyword}` };
      }
    }

    // Проверяем наличие LIMIT
    if (!lowerQuery.includes('limit') && !lowerQuery.includes('count(')) {
      // Это будет исправлено автоматически
    }

    return { isValid: true };
  }
}
