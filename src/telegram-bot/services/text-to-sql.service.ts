/**
 * Text-to-SQL Service
 * Преобразует естественный язык в SQL запросы
 */

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../db/schema";

export interface SQLResult {
  success: boolean;
  sql?: string;
  error?: string;
  explanation?: string;
}

export interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  rowCount?: number;
}

export class TextToSQLService {
  private db: PostgresJsDatabase<typeof schema>;
  
  // Словарь для перевода русских терминов в английские
  private readonly translations = {
    'пользователи': 'users',
    'пользователь': 'users', 
    'игроки': 'users',
    'игрок': 'users',
    'площадки': 'venues',
    'площадка': 'venues',
    'клубы': 'venues',
    'клуб': 'venues',
    'корты': 'courts',
    'корт': 'courts',
    'бронирования': 'bookings',
    'бронирование': 'bookings',
    'игры': 'game_sessions',
    'игра': 'game_sessions',
    'сессии': 'game_sessions',
    'сессия': 'game_sessions',
    'турниры': 'tournaments',
    'турнир': 'tournaments',
    'платежи': 'payments',
    'платеж': 'payments',
    'рейтинг': 'current_rating',
    'имя': 'first_name',
    'фамилия': 'last_name',
    'email': 'email',
    'телефон': 'phone',
    'статус': 'status',
    'цена': 'total_price',
    'сумма': 'amount',
    'дата': 'created_at',
    'время': 'start_time',
    'название': 'name',
    'описание': 'description',
  };

  // Паттерны для распознавания типов запросов
  private readonly patterns = {
    count: /сколько|количество|число/i,
    top: /топ|лучшие|первые \d+/i,
    recent: /последние|недавние|новые/i,
    search: /найди|найти|поиск|где/i,
    stats: /статистика|аналитика|отчет/i,
    today: /сегодня|сейчас/i,
    yesterday: /вчера/i,
    week: /неделя|недели/i,
    month: /месяц|месяца/i,
  };

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Преобразует текст на естественном языке в SQL запрос
   */
  async convertToSQL(text: string): Promise<SQLResult> {
    try {
      const normalizedText = this.normalizeText(text);
      const queryType = this.detectQueryType(normalizedText);
      const tables = this.extractTables(normalizedText);
      
      if (tables.length === 0) {
        return {
          success: false,
          error: "Не удалось определить таблицу для запроса. Попробуйте указать: пользователи, корты, бронирования и т.д."
        };
      }

      const sql = this.buildSQL(queryType, tables, normalizedText);
      
      if (!sql) {
        return {
          success: false,
          error: "Не удалось построить SQL запрос. Попробуйте переформулировать вопрос."
        };
      }

      // Проверяем безопасность запроса
      if (!this.isSafeQuery(sql)) {
        return {
          success: false,
          error: "Запрос содержит небезопасные операции. Разрешены только SELECT запросы."
        };
      }

      return {
        success: true,
        sql,
        explanation: this.explainQuery(queryType, tables[0])
      };

    } catch (error) {
      return {
        success: false,
        error: `Ошибка обработки запроса: ${error.message}`
      };
    }
  }

  /**
   * Выполняет SQL запрос
   */
  async executeQuery(sql: string): Promise<QueryResult> {
    try {
      // Добавляем LIMIT если его нет
      if (!sql.toLowerCase().includes('limit')) {
        sql += ' LIMIT 100';
      }

      const result = await this.db.execute(sql);
      
      return {
        success: true,
        data: result as any[],
        rowCount: result.length
      };

    } catch (error) {
      return {
        success: false,
        error: `Ошибка выполнения SQL: ${error.message}`
      };
    }
  }

  /**
   * Форматирует результат для отправки пользователю
   */
  async formatResult(originalQuery: string, sql: string, data: any[]): Promise<string> {
    let result = `🔍 **Запрос:** ${originalQuery}\n\n`;
    
    if (data.length === 0) {
      result += "📭 Данные не найдены";
      return result;
    }

    result += `📊 **Найдено записей:** ${data.length}\n\n`;

    // Форматируем первые 10 записей
    const displayData = data.slice(0, 10);
    
    if (data.length === 1 && typeof data[0] === 'object') {
      // Одна запись - показываем как карточку
      const record = data[0];
      for (const [key, value] of Object.entries(record)) {
        if (value !== null && value !== undefined) {
          result += `**${this.formatFieldName(key)}:** ${this.formatValue(value)}\n`;
        }
      }
    } else if (this.isSimpleCount(data)) {
      // Простой подсчет
      const count = Object.values(data[0])[0];
      result += `📈 **Результат:** ${count}`;
    } else {
      // Множественные записи - показываем как список
      for (let i = 0; i < displayData.length; i++) {
        const record = displayData[i];
        result += `**${i + 1}.** `;
        
        // Показываем основные поля
        const mainFields = this.getMainFields(record);
        result += mainFields.join(' • ') + '\n';
      }
      
      if (data.length > 10) {
        result += `\n... и еще ${data.length - 10} записей`;
      }
    }

    result += `\n\n🔧 **SQL:** \`${sql}\``;
    
    return result;
  }

  /**
   * Нормализует текст для обработки
   */
  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  /**
   * Определяет тип запроса
   */
  private detectQueryType(text: string): string {
    if (this.patterns.count.test(text)) return 'count';
    if (this.patterns.top.test(text)) return 'top';
    if (this.patterns.recent.test(text)) return 'recent';
    if (this.patterns.search.test(text)) return 'search';
    if (this.patterns.stats.test(text)) return 'stats';
    return 'select';
  }

  /**
   * Извлекает таблицы из текста
   */
  private extractTables(text: string): string[] {
    const tables = [];
    
    for (const [russian, english] of Object.entries(this.translations)) {
      if (text.includes(russian)) {
        if (!tables.includes(english)) {
          tables.push(english);
        }
      }
    }
    
    return tables;
  }

  /**
   * Строит SQL запрос
   */
  private buildSQL(queryType: string, tables: string[], text: string): string {
    const mainTable = tables[0];
    
    switch (queryType) {
      case 'count':
        return `SELECT COUNT(*) as count FROM ${mainTable}`;
        
      case 'top':
        const topMatch = text.match(/(\d+)/);
        const limit = topMatch ? topMatch[1] : '10';
        
        if (mainTable === 'users') {
          return `SELECT first_name, last_name, username, current_rating FROM ${mainTable} ORDER BY current_rating DESC LIMIT ${limit}`;
        }
        return `SELECT * FROM ${mainTable} ORDER BY created_at DESC LIMIT ${limit}`;
        
      case 'recent':
        return `SELECT * FROM ${mainTable} ORDER BY created_at DESC LIMIT 10`;
        
      case 'search':
        // Простой поиск - нужно будет улучшить
        return `SELECT * FROM ${mainTable} LIMIT 10`;
        
      case 'stats':
        if (mainTable === 'users') {
          return `SELECT 
            COUNT(*) as total_users,
            AVG(current_rating) as avg_rating,
            COUNT(CASE WHEN is_account_verified THEN 1 END) as verified_users
            FROM ${mainTable}`;
        }
        return `SELECT COUNT(*) as total FROM ${mainTable}`;
        
      default:
        return `SELECT * FROM ${mainTable} LIMIT 10`;
    }
  }

  /**
   * Проверяет безопасность SQL запроса
   */
  private isSafeQuery(sql: string): boolean {
    const lowerSQL = sql.toLowerCase();
    
    // Разрешены только SELECT запросы
    if (!lowerSQL.startsWith('select')) {
      return false;
    }
    
    // Запрещенные операции
    const forbidden = ['drop', 'delete', 'update', 'insert', 'alter', 'create', 'truncate'];
    
    for (const word of forbidden) {
      if (lowerSQL.includes(word)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Объясняет что делает запрос
   */
  private explainQuery(queryType: string, table: string): string {
    const tableNames = {
      'users': 'пользователей',
      'venues': 'площадок', 
      'courts': 'кортов',
      'bookings': 'бронирований',
      'game_sessions': 'игровых сессий',
      'tournaments': 'турниров',
      'payments': 'платежей'
    };
    
    const tableName = tableNames[table] || table;
    
    switch (queryType) {
      case 'count': return `Подсчет количества ${tableName}`;
      case 'top': return `Топ ${tableName} по рейтингу`;
      case 'recent': return `Последние ${tableName}`;
      case 'stats': return `Статистика по ${tableName}`;
      default: return `Выборка ${tableName}`;
    }
  }

  /**
   * Форматирует название поля
   */
  private formatFieldName(field: string): string {
    const fieldNames = {
      'first_name': 'Имя',
      'last_name': 'Фамилия',
      'username': 'Логин',
      'email': 'Email',
      'current_rating': 'Рейтинг',
      'total_price': 'Цена',
      'status': 'Статус',
      'created_at': 'Создано',
      'name': 'Название',
      'count': 'Количество',
      'total_users': 'Всего пользователей',
      'avg_rating': 'Средний рейтинг',
      'verified_users': 'Подтвержденных'
    };
    
    return fieldNames[field] || field;
  }

  /**
   * Форматирует значение
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'не указано';
    if (typeof value === 'number') return value.toLocaleString('ru-RU');
    if (value instanceof Date) return value.toLocaleDateString('ru-RU');
    return String(value);
  }

  /**
   * Проверяет является ли результат простым подсчетом
   */
  private isSimpleCount(data: any[]): boolean {
    return data.length === 1 && Object.keys(data[0]).length === 1;
  }

  /**
   * Получает основные поля для отображения
   */
  private getMainFields(record: any): string[] {
    const fields = [];
    
    // Приоритетные поля для отображения
    const priority = ['name', 'first_name', 'last_name', 'username', 'email', 'current_rating', 'status', 'total_price'];
    
    for (const field of priority) {
      if (record[field] !== null && record[field] !== undefined) {
        fields.push(`${this.formatFieldName(field)}: ${this.formatValue(record[field])}`);
        if (fields.length >= 3) break;
      }
    }
    
    return fields;
  }
}
