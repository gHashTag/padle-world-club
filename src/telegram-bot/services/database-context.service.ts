/**
 * Database Context Service
 * Предоставляет контекст и метаданные о базе данных
 */

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "../../db/schema";

export interface DatabaseStats {
  users: {
    total: number;
    verified: number;
    averageRating: number;
  };
  venues: {
    total: number;
    active: number;
  };
  courts: {
    total: number;
    indoor: number;
    outdoor: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    today: number;
  };
  gameSessions: {
    total: number;
    completed: number;
  };
  tournaments: {
    total: number;
    active: number;
  };
  payments: {
    total: number;
    totalAmount: number;
  };
}

export interface TableInfo {
  name: string;
  description: string;
  recordCount: number;
  columns: string[];
}

export class DatabaseContextService {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Получает общую статистику базы данных
   */
  async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      // Статистика пользователей
      const userStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_account_verified THEN 1 END) as verified,
          ROUND(AVG(current_rating::numeric), 1) as avg_rating
        FROM users
      `);

      // Статистика площадок
      const venueStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active THEN 1 END) as active
        FROM venues
      `);

      // Статистика кортов
      const courtStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN court_type = 'indoor' THEN 1 END) as indoor,
          COUNT(CASE WHEN court_type = 'outdoor' THEN 1 END) as outdoor
        FROM courts
      `);

      // Статистика бронирований
      const bookingStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN DATE(start_time) = CURRENT_DATE THEN 1 END) as today
        FROM bookings
      `);

      // Статистика игровых сессий
      const gameSessionStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM game_sessions
      `);

      // Статистика турниров
      const tournamentStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status IN ('registration_open', 'in_progress') THEN 1 END) as active
        FROM tournaments
      `);

      // Статистика платежей
      const paymentStats = await this.db.execute(sql`
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(amount::numeric), 0) as total_amount
        FROM payments
        WHERE status = 'completed'
      `);

      return {
        users: {
          total: Number(userStats[0]?.total || 0),
          verified: Number(userStats[0]?.verified || 0),
          averageRating: Number(userStats[0]?.avg_rating || 0),
        },
        venues: {
          total: Number(venueStats[0]?.total || 0),
          active: Number(venueStats[0]?.active || 0),
        },
        courts: {
          total: Number(courtStats[0]?.total || 0),
          indoor: Number(courtStats[0]?.indoor || 0),
          outdoor: Number(courtStats[0]?.outdoor || 0),
        },
        bookings: {
          total: Number(bookingStats[0]?.total || 0),
          confirmed: Number(bookingStats[0]?.confirmed || 0),
          today: Number(bookingStats[0]?.today || 0),
        },
        gameSessions: {
          total: Number(gameSessionStats[0]?.total || 0),
          completed: Number(gameSessionStats[0]?.completed || 0),
        },
        tournaments: {
          total: Number(tournamentStats[0]?.total || 0),
          active: Number(tournamentStats[0]?.active || 0),
        },
        payments: {
          total: Number(paymentStats[0]?.total || 0),
          totalAmount: Number(paymentStats[0]?.total_amount || 0),
        },
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw new Error('Не удалось получить статистику базы данных');
    }
  }

  /**
   * Получает информацию о схеме базы данных
   */
  async getSchemaInfo(): Promise<TableInfo[]> {
    try {
      const tables = [
        {
          name: 'users',
          description: 'Пользователи системы (игроки, тренеры, админы)',
          columns: ['id', 'username', 'first_name', 'last_name', 'email', 'current_rating', 'user_role', 'is_account_verified']
        },
        {
          name: 'venues',
          description: 'Спортивные площадки и клубы',
          columns: ['id', 'name', 'description', 'address', 'city', 'phone', 'email', 'is_active']
        },
        {
          name: 'courts',
          description: 'Корты для игры в паддл',
          columns: ['id', 'venue_id', 'name', 'court_type', 'surface', 'hourly_rate', 'is_active']
        },
        {
          name: 'bookings',
          description: 'Бронирования кортов',
          columns: ['id', 'court_id', 'user_id', 'start_time', 'end_time', 'total_price', 'status']
        },
        {
          name: 'booking_participants',
          description: 'Участники бронирований',
          columns: ['id', 'booking_id', 'user_id', 'role', 'joined_at']
        },
        {
          name: 'payments',
          description: 'Платежи за бронирования',
          columns: ['id', 'booking_id', 'user_id', 'amount', 'payment_method', 'status', 'paid_at']
        },
        {
          name: 'game_sessions',
          description: 'Игровые сессии',
          columns: ['id', 'court_id', 'organizer_id', 'start_time', 'end_time', 'game_type', 'status', 'is_ranked']
        },
        {
          name: 'game_players',
          description: 'Игроки в сессиях',
          columns: ['id', 'game_session_id', 'user_id', 'team', 'position', 'score']
        },
        {
          name: 'rating_changes',
          description: 'Изменения рейтинга игроков',
          columns: ['id', 'user_id', 'game_session_id', 'old_rating', 'new_rating', 'rating_change']
        },
        {
          name: 'tournaments',
          description: 'Турниры',
          columns: ['id', 'name', 'venue_id', 'start_date', 'end_date', 'max_participants', 'entry_fee', 'status']
        },
        {
          name: 'tournament_participants',
          description: 'Участники турниров',
          columns: ['id', 'tournament_id', 'user_id', 'registration_date', 'status']
        },
        {
          name: 'class_definitions',
          description: 'Определения тренировочных классов',
          columns: ['id', 'name', 'description', 'skill_level', 'duration', 'max_participants', 'price']
        },
        {
          name: 'class_schedules',
          description: 'Расписание тренировочных классов',
          columns: ['id', 'class_definition_id', 'court_id', 'instructor_id', 'start_time', 'end_time', 'status']
        },
        {
          name: 'notifications',
          description: 'Уведомления пользователей',
          columns: ['id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at']
        },
        {
          name: 'tasks',
          description: 'Задачи и напоминания',
          columns: ['id', 'user_id', 'title', 'description', 'due_date', 'status', 'priority']
        },
        {
          name: 'feedback',
          description: 'Отзывы и обратная связь',
          columns: ['id', 'user_id', 'category', 'rating', 'comment', 'status', 'created_at']
        }
      ];

      // Получаем количество записей для каждой таблицы
      const tablesWithCounts = await Promise.all(
        tables.map(async (table) => {
          try {
            const countResult = await this.db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table.name}`));
            const recordCount = Number(countResult[0]?.count || 0);
            
            return {
              ...table,
              recordCount
            };
          } catch (error) {
            console.error(`Error counting records in ${table.name}:`, error);
            return {
              ...table,
              recordCount: 0
            };
          }
        })
      );

      return tablesWithCounts;
    } catch (error) {
      console.error('Error getting schema info:', error);
      throw new Error('Не удалось получить информацию о схеме БД');
    }
  }

  /**
   * Получает примеры данных из таблицы
   */
  async getTableSample(tableName: string, limit: number = 3): Promise<any[]> {
    try {
      const result = await this.db.execute(sql.raw(`SELECT * FROM ${tableName} LIMIT ${limit}`));
      return result as any[];
    } catch (error) {
      console.error(`Error getting sample from ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Поиск по всем таблицам
   */
  async globalSearch(searchTerm: string): Promise<any[]> {
    const results = [];
    
    try {
      // Поиск в пользователях
      const userResults = await this.db.execute(sql`
        SELECT 'users' as table_name, id, first_name, last_name, username, email
        FROM users 
        WHERE first_name ILIKE ${`%${searchTerm}%`} 
           OR last_name ILIKE ${`%${searchTerm}%`}
           OR username ILIKE ${`%${searchTerm}%`}
           OR email ILIKE ${`%${searchTerm}%`}
        LIMIT 5
      `);
      results.push(...userResults);

      // Поиск в площадках
      const venueResults = await this.db.execute(sql`
        SELECT 'venues' as table_name, id, name, description, city
        FROM venues 
        WHERE name ILIKE ${`%${searchTerm}%`} 
           OR description ILIKE ${`%${searchTerm}%`}
           OR city ILIKE ${`%${searchTerm}%`}
        LIMIT 5
      `);
      results.push(...venueResults);

      // Поиск в турнирах
      const tournamentResults = await this.db.execute(sql`
        SELECT 'tournaments' as table_name, id, name, description, status
        FROM tournaments 
        WHERE name ILIKE ${`%${searchTerm}%`} 
           OR description ILIKE ${`%${searchTerm}%`}
        LIMIT 5
      `);
      results.push(...tournamentResults);

      return results;
    } catch (error) {
      console.error('Error in global search:', error);
      return [];
    }
  }

  /**
   * Получает связанные данные для контекста
   */
  async getRelatedData(tableName: string, recordId: string): Promise<any> {
    try {
      switch (tableName) {
        case 'users':
          return await this.getUserRelatedData(recordId);
        case 'bookings':
          return await this.getBookingRelatedData(recordId);
        case 'tournaments':
          return await this.getTournamentRelatedData(recordId);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error getting related data for ${tableName}:`, error);
      return null;
    }
  }

  private async getUserRelatedData(userId: string) {
    const bookings = await this.db.execute(sql`
      SELECT COUNT(*) as count FROM bookings WHERE user_id = ${userId}
    `);
    
    const gameSessions = await this.db.execute(sql`
      SELECT COUNT(*) as count FROM game_players gp
      JOIN game_sessions gs ON gp.game_session_id = gs.id
      WHERE gp.user_id = ${userId}
    `);

    return {
      bookings: Number(bookings[0]?.count || 0),
      gameSessions: Number(gameSessions[0]?.count || 0)
    };
  }

  private async getBookingRelatedData(bookingId: string) {
    const participants = await this.db.execute(sql`
      SELECT COUNT(*) as count FROM booking_participants WHERE booking_id = ${bookingId}
    `);

    return {
      participants: Number(participants[0]?.count || 0)
    };
  }

  private async getTournamentRelatedData(tournamentId: string) {
    const participants = await this.db.execute(sql`
      SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ${tournamentId}
    `);

    return {
      participants: Number(participants[0]?.count || 0)
    };
  }
}
