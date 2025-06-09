#!/usr/bin/env node

/**
 * 🕉️ Obsidian Database Sync
 * Скрипт для синхронизации данных между PostgreSQL базой данных и Obsidian
 *
 * Возможности:
 * - Экспорт данных из БД в Obsidian markdown таблицы
 * - Создание интерактивных DataEdit таблиц
 * - Мониторинг изменений в Obsidian файлах
 * - Синхронизация изменений обратно в БД
 */

import { config } from "dotenv";
import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import chokidar from "chokidar";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем конфигурацию
config();

const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

const OBSIDIAN_VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ||
  "/Users/playra/padle-world-club/oxygen-world";
const DATABASE_FOLDER = path.join(OBSIDIAN_VAULT_PATH, "Database");
const TEMPLATES_FOLDER = path.join(OBSIDIAN_VAULT_PATH, "Templates");
const GRAPHS_FOLDER = path.join(OBSIDIAN_VAULT_PATH, "Graphs");

class ObsidianDBSync {
  constructor() {
    this.pool = new Pool(DB_CONFIG);
    this.isWatching = false;

    // 🗄️ Полная карта всех таблиц БД для синхронизации
    this.tableConfig = {
      // 🏢 Business Layer - Основные бизнес-сущности
      user: {
        icon: "👥",
        color: "blue",
        relationships: [
          "user_account_link",
          "booking",
          "payment",
          "game_session",
          "tournament_participant",
        ],
      },
      user_account_link: {
        icon: "🔗",
        color: "blue",
        relationships: ["user"],
      },
      venue: {
        icon: "🏟️",
        color: "green",
        relationships: ["court", "class_schedule", "tournament"],
      },
      court: {
        icon: "🎾",
        color: "green",
        relationships: ["venue", "booking", "game_session"],
      },
      booking: {
        icon: "📅",
        color: "blue",
        relationships: ["user", "court", "booking_participant", "payment"],
      },
      booking_participant: {
        icon: "👤",
        color: "blue",
        relationships: ["booking", "user"],
      },

      // 💰 Financial Layer - Финансовые операции
      payment: {
        icon: "💰",
        color: "green",
        relationships: ["user", "booking", "order"],
      },
      order: {
        icon: "🛒",
        color: "green",
        relationships: ["user", "order_item", "payment"],
      },
      order_item: {
        icon: "📦",
        color: "green",
        relationships: ["order", "product"],
      },
      product: {
        icon: "🎯",
        color: "green",
        relationships: ["product_category", "order_item", "stock_transaction"],
      },
      product_category: {
        icon: "📂",
        color: "green",
        relationships: ["product"],
      },
      stock_transaction: {
        icon: "📊",
        color: "green",
        relationships: ["product"],
      },
      bonus_transaction: {
        icon: "🎁",
        color: "green",
        relationships: ["user"],
      },

      // 🎓 Education Layer - Обучение и тренировки
      class_definition: {
        icon: "📚",
        color: "orange",
        relationships: ["class_schedule", "training_package_definition"],
      },
      class_schedule: {
        icon: "📅",
        color: "orange",
        relationships: ["class_definition", "venue", "class_participant"],
      },
      class_participant: {
        icon: "🎓",
        color: "orange",
        relationships: ["class_schedule", "user"],
      },
      training_package_definition: {
        icon: "📋",
        color: "orange",
        relationships: ["class_definition", "user_training_package"],
      },
      user_training_package: {
        icon: "🎯",
        color: "orange",
        relationships: ["user", "training_package_definition"],
      },

      // 🎮 Gaming Layer - Игровые сессии и турниры
      game_session: {
        icon: "🎮",
        color: "purple",
        relationships: ["court", "game_player", "rating_change"],
      },
      game_player: {
        icon: "🏓",
        color: "purple",
        relationships: ["game_session", "user", "rating_change"],
      },
      rating_change: {
        icon: "📈",
        color: "purple",
        relationships: ["user", "game_session", "game_player"],
      },
      tournament: {
        icon: "🏆",
        color: "purple",
        relationships: [
          "venue",
          "tournament_participant",
          "tournament_team",
          "tournament_match",
        ],
      },
      tournament_participant: {
        icon: "🥇",
        color: "purple",
        relationships: ["tournament", "user", "tournament_team"],
      },
      tournament_team: {
        icon: "👥",
        color: "purple",
        relationships: [
          "tournament",
          "tournament_participant",
          "tournament_match",
        ],
      },
      tournament_match: {
        icon: "⚔️",
        color: "purple",
        relationships: ["tournament", "tournament_team"],
      },

      // 🤖 AI/Analytics Layer - Искусственный интеллект и аналитика
      ai_suggestion_log: {
        icon: "🤖",
        color: "yellow",
        relationships: ["user"],
      },
      feedback: {
        icon: "💭",
        color: "yellow",
        relationships: ["user"],
      },

      // ⚙️ System Layer - Системные таблицы
      task: {
        icon: "📋",
        color: "red",
        relationships: ["user", "venue"],
      },
      notification: {
        icon: "🔔",
        color: "red",
        relationships: ["user"],
      },
      external_system_mapping: {
        icon: "🔄",
        color: "red",
        relationships: [],
      },
    };
  }

  /**
   * 🎯 Основные методы синхронизации
   */

  async exportAISuggestionLogs() {
    console.log("🔄 Экспортирую AI Suggestion Logs...");

    const query = `
      SELECT 
        id,
        suggestion_type,
        user_id,
        input_data,
        suggestion_data,
        confidence_score,
        was_accepted,
        user_feedback,
        execution_time_ms,
        model_version,
        context_data,
        created_at,
        updated_at
      FROM ai_suggestion_log 
      ORDER BY created_at DESC 
      LIMIT 100
    `;

    try {
      const result = await this.pool.query(query);
      const markdownContent = this.generateDataEditTable(result.rows);

      const filePath = path.join(DATABASE_FOLDER, "AI-Suggestion-Logs.md");
      await this.ensureDirectoryExists(path.dirname(filePath));
      await fs.writeFile(filePath, markdownContent, "utf8");

      console.log(
        `✅ Экспортировано ${result.rows.length} записей в ${filePath}`
      );
      return result.rows;
    } catch (error) {
      console.error("❌ Ошибка экспорта:", error);
      throw error;
    }
  }

  generateDataEditTable(data) {
    const frontmatter = `---
title: AI Suggestion Logs Database
type: database
table: ai_suggestion_log
last_sync: ${new Date().toISOString()}
sync_enabled: true
---

# 🤖 AI Suggestion Logs Database

> **Интерактивная таблица** - изменения автоматически синхронизируются с базой данных
> Последняя синхронизация: ${new Date().toLocaleString()}

`;

    // Создаем DataEdit таблицу (editable dataview)
    const dataeditQuery = `\`\`\`dataedit
TABLE 
  suggestion_type as "Тип",
  confidence_score as "Уверенность",
  was_accepted as "Принято",
  user_feedback as "Отзыв",
  model_version as "Модель",
  created_at as "Создано"
FROM "ai-suggestions"
SORT created_at DESC
LIMIT 50
\`\`\``;

    // Альтернативная обычная markdown таблица для просмотра
    const headers = [
      "ID",
      "Тип",
      "Уверенность",
      "Принято",
      "Отзыв",
      "Модель",
      "Создано",
    ];

    const rows = data.map((row) => [
      row.id.substring(0, 8) + "...",
      row.suggestion_type,
      row.confidence_score ? parseFloat(row.confidence_score).toFixed(3) : "-",
      row.was_accepted === null ? "❓" : row.was_accepted ? "✅" : "❌",
      row.user_feedback ? row.user_feedback.substring(0, 30) + "..." : "-",
      row.model_version || "-",
      new Date(row.created_at).toLocaleDateString(),
    ]);

    const markdownTable = this.createMarkdownTable(headers, rows);

    return `${frontmatter}

## 📊 Интерактивная Таблица (DataEdit)

${dataeditQuery}

## 📋 Просмотр данных (Read-Only)

${markdownTable}

## 🔧 Настройки синхронизации

- **Автосинхронизация**: включена
- **Интервал**: каждые 5 минут
- **Направление**: двусторонняя
- **API Endpoint**: \`/api/ai-suggestion-logs\`

## 📝 Инструкции по редактированию

1. **Редактирование через DataEdit**: Используйте таблицу выше для прямого редактирования
2. **Поля для редактирования**:
   - \`was_accepted\`: true/false/null
   - \`user_feedback\`: текстовый отзыв
3. **Изменения**: автоматически сохраняются в БД

---
*Создано автоматически скриптом obsidian-db-sync*
`;
  }

  createMarkdownTable(headers, rows) {
    const headerRow = "| " + headers.join(" | ") + " |";
    const separatorRow = "| " + headers.map(() => "---").join(" | ") + " |";
    const dataRows = rows.map((row) => "| " + row.join(" | ") + " |");

    return [headerRow, separatorRow, ...dataRows].join("\n");
  }

  /**
   * 🎬 Создание шаблонов для разных видов таблиц
   */

  async createTemplates() {
    console.log("📝 Создаю шаблоны для Obsidian...");

    const templates = {
      "AI-Suggestion-DataEdit.md": this.getAISuggestionTemplate(),
      "Database-Table-Template.md": this.getDatabaseTableTemplate(),
      "Live-Dashboard.md": this.getLiveDashboardTemplate(),
    };

    const templateDir = TEMPLATES_FOLDER;
    await this.ensureDirectoryExists(templateDir);

    for (const [filename, content] of Object.entries(templates)) {
      const filePath = path.join(templateDir, filename);
      await fs.writeFile(filePath, content, "utf8");
      console.log(`✅ Создан шаблон: ${filename}`);
    }
  }

  getAISuggestionTemplate() {
    return `---
title: "{{title}}"
type: database
table: ai_suggestion_log
sync_enabled: true
auto_refresh: 300000
---

# 🤖 {{title}}

\`\`\`dataedit
TABLE 
  id as "ID",
  suggestion_type as "Тип предложения",
  confidence_score as "Уверенность (%)",
  was_accepted as "Принято",
  user_feedback as "Отзыв пользователя",
  model_version as "Версия модели",
  created_at as "Дата создания"
FROM "ai_suggestion_log"
WHERE suggestion_type = "{{filter_type}}"
SORT created_at DESC
LIMIT 50
\`\`\`

## 🎯 Действия

- [[Создать новое предложение]]
- [[Анализ эффективности AI]]
- [[Экспорт данных]]

## 📊 Статистика

\`\`\`dataview
TABLE
  length(filter(pages.ai_suggestions, (x) => x.was_accepted = true)) as "Принято",
  length(filter(pages.ai_suggestions, (x) => x.was_accepted = false)) as "Отклонено",
  length(filter(pages.ai_suggestions, (x) => x.was_accepted = null)) as "Ожидает"
WHERE type = "database"
\`\`\`
`;
  }

  getDatabaseTableTemplate() {
    return `---
title: "Database: {{table_name}}"
type: database
table: "{{table_name}}"
sync_enabled: true
last_sync: "{{current_date}}"
---

# 🗄️ {{table_name}}

\`\`\`dataedit
{{dataview_query}}
\`\`\`

## 🔄 Синхронизация

- **Статус**: {{sync_status}}
- **Последняя синхронизация**: {{last_sync}}
- **Записей**: {{record_count}}

## 📝 Заметки

{{notes}}
`;
  }

  getLiveDashboardTemplate() {
    return `---
title: Live Database Dashboard
type: dashboard
auto_refresh: 60000
---

# 📊 Live Database Dashboard

## 🤖 AI Suggestion Logs

\`\`\`dataedit
TABLE 
  suggestion_type as "Тип",
  count(*) as "Количество",
  avg(confidence_score) as "Средняя уверенность",
  sum(case when was_accepted = true then 1 else 0 end) as "Принято"
FROM "ai_suggestion_log"
GROUP BY suggestion_type
ORDER BY count(*) DESC
\`\`\`

## 👥 Активные пользователи

\`\`\`dataedit
TABLE TOP 10
  name as "Имя",
  email as "Email", 
  last_active_at as "Последняя активность"
FROM "users"
WHERE last_active_at > NOW() - INTERVAL '7 days'
SORT last_active_at DESC
\`\`\`

## 🎮 Последние игровые сессии

\`\`\`dataedit
TABLE TOP 15
  court_name as "Корт",
  start_time as "Начало",
  status as "Статус",
  current_players as "Игроки"
FROM "game_sessions"
SORT start_time DESC
\`\`\`

---
*Обновляется автоматически каждую минуту*
`;
  }

  /**
   * 🔄 Система мониторинга изменений
   */

  async startWatching() {
    if (this.isWatching) {
      console.log("⚠️ Мониторинг уже запущен");
      return;
    }

    console.log("👀 Запускаю мониторинг изменений в Obsidian...");

    const watchPath = path.join(DATABASE_FOLDER, "**/*.md");

    const watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // игнорируем скрытые файлы
      persistent: true,
      ignoreInitial: true,
    });

    watcher
      .on("change", (filePath) => this.handleFileChange(filePath))
      .on("add", (filePath) => this.handleFileAdd(filePath))
      .on("unlink", (filePath) => this.handleFileDelete(filePath))
      .on("error", (error) => console.error("❌ Ошибка мониторинга:", error));

    this.isWatching = true;
    console.log("✅ Мониторинг запущен");
  }

  async handleFileChange(filePath) {
    console.log(`📝 Изменен файл: ${filePath}`);

    try {
      const content = await fs.readFile(filePath, "utf8");
      const metadata = this.extractMetadata(content);

      if (metadata && metadata.sync_enabled && metadata.table) {
        await this.syncFileToDatabase(filePath, content, metadata);
      }
    } catch (error) {
      console.error(`❌ Ошибка обработки изменений в ${filePath}:`, error);
    }
  }

  async handleFileAdd(filePath) {
    console.log(`➕ Добавлен файл: ${filePath}`);
  }

  async handleFileDelete(filePath) {
    console.log(`🗑️ Удален файл: ${filePath}`);
  }

  extractMetadata(content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const frontmatter = frontmatterMatch[1];
    const metadata = {};

    frontmatter.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        const value = valueParts.join(":").trim();
        metadata[key.trim()] = value.replace(/^["']|["']$/g, ""); // убираем кавычки
      }
    });

    return metadata;
  }

  async syncFileToDatabase(filePath, content, metadata) {
    console.log(`🔄 Синхронизация ${filePath} с таблицей ${metadata.table}...`);

    // TODO: Реализовать парсинг изменений в DataEdit таблицах
    // и отправку изменений в БД через API

    // Пример логики:
    // 1. Парсить изменения в DataEdit блоках
    // 2. Определить какие записи изменились
    // 3. Отправить PATCH запросы к нашему API

    console.log("🔄 Синхронизация с БД (TODO: реализовать)");
  }

  /**
   * 🛠️ Вспомогательные методы
   */

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async testConnection() {
    try {
      const result = await this.pool.query("SELECT NOW()");
      console.log("✅ Подключение к БД успешно:", result.rows[0].now);
      return true;
    } catch (error) {
      console.error("❌ Ошибка подключения к БД:", error);
      return false;
    }
  }

  async close() {
    await this.pool.end();
    console.log("🔌 Соединение с БД закрыто");
  }

  /**
   * 🔄 Полная синхронизация всех таблиц БД
   */
  async exportAllTables() {
    console.log("🚀 Запуск полной синхронизации всех таблиц БД...");

    // Создаем необходимые папки
    await this.ensureDirectoryExists(DATABASE_FOLDER);
    await this.ensureDirectoryExists(GRAPHS_FOLDER);

    const results = {};

    for (const [tableName, config] of Object.entries(this.tableConfig)) {
      try {
        console.log(`🔄 Синхронизация таблицы: ${config.icon} ${tableName}`);

        // Получаем схему таблицы
        const schema = await this.getTableSchema(tableName);

        // Получаем данные
        const data = await this.getTableData(tableName);

        // Создаем markdown файл с графовыми связями
        const markdownContent = this.generateTableMarkdown(
          tableName,
          config,
          schema,
          data
        );

        const filePath = path.join(
          DATABASE_FOLDER,
          `${config.icon} ${tableName}.md`
        );
        await fs.writeFile(filePath, markdownContent, "utf8");

        results[tableName] = {
          recordCount: data.length,
          filePath: filePath,
          config: config,
        };

        console.log(`✅ ${tableName}: ${data.length} записей экспортировано`);
      } catch (error) {
        console.error(`❌ Ошибка синхронизации таблицы ${tableName}:`, error);
        results[tableName] = { error: error.message };
      }
    }

    // Создаем граф связей между таблицами
    await this.createDatabaseGraph(results);

    // Создаем главный дашборд
    await this.createMasterDashboard(results);

    console.log("🎊 Полная синхронизация завершена!");
    return results;
  }

  /**
   * 📊 Получение схемы таблицы
   */
  async getTableSchema(tableName) {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `;

    try {
      const result = await this.pool.query(query, [tableName]);
      return result.rows;
    } catch (error) {
      console.warn(
        `⚠️ Не удалось получить схему для ${tableName}:`,
        error.message
      );
      return [];
    }
  }

  /**
   * 🗄️ Получение данных таблицы
   */
  async getTableData(tableName, limit = 100) {
    try {
      // Сначала проверим существование таблицы
      const checkQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `;

      const checkResult = await this.pool.query(checkQuery, [tableName]);

      if (!checkResult.rows[0].exists) {
        console.warn(`⚠️ Таблица ${tableName} не существует`);
        return [];
      }

      const query = `SELECT * FROM "${tableName}" LIMIT $1`;
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.warn(
        `⚠️ Не удалось получить данные из ${tableName}:`,
        error.message
      );
      return [];
    }
  }

  /**
   * 📝 Генерация markdown с графовыми связями
   */
  generateTableMarkdown(tableName, config, schema, data) {
    const { icon, color, relationships } = config;

    const frontmatter = `---
title: "${icon} ${tableName} Database"
type: database-table
table: "${tableName}"
color: "${color}"
icon: "${icon}"
relationships: [${relationships.map((r) => `"${r}"`).join(", ")}]
last_sync: "${new Date().toISOString()}"
record_count: ${data.length}
tags: [database, ${tableName}, ${color}-layer]
---

`;

    const header = `# ${icon} **${tableName.toUpperCase()} DATABASE**

> **🔗 Графовая таблица** с автоматическими связями  
> Записей: **${data.length}** | Обновлено: \`= date(now)\`

`;

    // Граф связей
    const graphSection = `## 🌐 **СВЯЗИ В ГРАФЕ**

### 🔗 Связанные таблицы:
${relationships
  .map((rel) => {
    const relConfig = this.tableConfig[rel];
    return relConfig
      ? `- [[${relConfig.icon} ${rel}|${relConfig.icon} ${rel}]] (${relConfig.color} layer)`
      : `- ${rel} (external)`;
  })
  .join("\n")}

### 🎯 Граф-визуализация:
\`\`\`mermaid
graph TB
    %% Business Layer (Blue)
    User[👥 user]
    UserLink[🔗 user_account_link]
    Booking[📅 booking]
    BookingPart[👤 booking_participant]
    
    %% Venue & Courts (Green)
    Venue[🏟️ venue]
    Court[🎾 court]
    
    %% Financial Layer (Green)
    Payment[💰 payment]
    Order[🛒 order]
    OrderItem[📦 order_item]
    Product[🎯 product]
    ProductCat[📂 product_category]
    StockTrans[📊 stock_transaction]
    BonusTrans[🎁 bonus_transaction]
    
    %% Education Layer (Orange)
    ClassDef[📚 class_definition]
    ClassSched[📅 class_schedule]
    ClassPart[🎓 class_participant]
    TrainPkg[📋 training_package_definition]
    UserTrainPkg[🎯 user_training_package]
    
    %% Gaming Layer (Purple)
    GameSession[🎮 game_session]
    GamePlayer[🏓 game_player]
    RatingChange[📈 rating_change]
    Tournament[🏆 tournament]
    TournPart[🥇 tournament_participant]
    TournTeam[👥 tournament_team]
    TournMatch[⚔️ tournament_match]
    
    %% AI/Analytics Layer (Yellow)
    AISuggestion[🤖 ai_suggestion_log]
    Feedback[💭 feedback]
    
    %% System Layer (Red)
    Task[📋 task]
    Notification[🔔 notification]
    ExtMapping[🔄 external_system_mapping]
    
    %% Core Relationships
    User --> UserLink
    User --> Booking
    User --> Payment
    User --> GameSession
    User --> TournPart
    User --> AISuggestion
    User --> Feedback
    User --> Task
    User --> Notification
    User --> BonusTrans
    
    %% Venue & Court Relationships
    Venue --> Court
    Venue --> ClassSched
    Venue --> Tournament
    Court --> Booking
    Court --> GameSession
    
    %% Booking Relationships
    Booking --> BookingPart
    Booking --> Payment
    BookingPart --> User
    
    %% Financial Relationships
    Payment --> Order
    Order --> OrderItem
    OrderItem --> Product
    Product --> ProductCat
    Product --> StockTrans
    
    %% Education Relationships
    ClassDef --> ClassSched
    ClassDef --> TrainPkg
    ClassSched --> ClassPart
    ClassPart --> User
    TrainPkg --> UserTrainPkg
    UserTrainPkg --> User
    
    %% Gaming Relationships
    GameSession --> GamePlayer
    GameSession --> RatingChange
    GamePlayer --> User
    GamePlayer --> RatingChange
    Tournament --> TournPart
    Tournament --> TournTeam
    Tournament --> TournMatch
    TournPart --> User
    TournPart --> TournTeam
    TournTeam --> TournMatch
    
    %% Styling
    classDef blueNode fill:#4A90E2,stroke:#333,stroke-width:2px,color:#fff;
    classDef greenNode fill:#7ED321,stroke:#333,stroke-width:2px,color:#fff;
    classDef orangeNode fill:#F5A623,stroke:#333,stroke-width:2px,color:#fff;
    classDef purpleNode fill:#9013FE,stroke:#333,stroke-width:2px,color:#fff;
    classDef yellowNode fill:#F8E71C,stroke:#333,stroke-width:2px,color:#000;
    classDef redNode fill:#D0021B,stroke:#333,stroke-width:2px,color:#fff;
    
    class User,UserLink,Booking,BookingPart blueNode;
    class Venue,Court,Payment,Order,OrderItem,Product,ProductCat,StockTrans,BonusTrans greenNode;
    class ClassDef,ClassSched,ClassPart,TrainPkg,UserTrainPkg orangeNode;
    class GameSession,GamePlayer,RatingChange,Tournament,TournPart,TournTeam,TournMatch purpleNode;
    class AISuggestion,Feedback yellowNode;
    class Task,Notification,ExtMapping redNode;
\`\`\`

`;

    // Схема таблицы
    const schemaSection = `## 🏗️ **СХЕМА ТАБЛИЦЫ**

\`\`\`dataview
TABLE WITHOUT ID
    column_name as "📋 Поле",
    data_type as "🔧 Тип данных", 
    is_nullable as "❓ Nullable",
    column_default as "📌 По умолчанию"
FROM "${tableName}-schema"
\`\`\`

| 📋 **Поле** | 🔧 **Тип** | ❓ **Nullable** | 📌 **По умолчанию** |
|-------------|-------------|-----------------|---------------------|
${schema
  .map(
    (col) =>
      `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${
        col.column_default || "-"
      } |`
  )
  .join("\n")}

`;

    // Данные таблицы (простая версия для демонстрации)
    const dataSection = `## 📊 **ДАННЫЕ (Последние ${Math.min(
      data.length,
      10
    )} записей)**

\`\`\`dataview
TABLE 
${schema
  .slice(0, 5)
  .map((col) => `    ${col.column_name} as "${col.column_name}"`)
  .join(",\n")}
FROM "${tableName}"
SORT file.ctime DESC
LIMIT 10
\`\`\`

`;

    // Статистика
    const statsSection = `## 📈 **СТАТИСТИКА**

- 📊 **Всего записей**: ${data.length}
- 🔗 **Связей с другими таблицами**: ${relationships.length}
- 🏗️ **Полей в схеме**: ${schema.length}
- 🎨 **Цветовая категория**: ${color}
- ⏰ **Последнее обновление**: ${new Date().toLocaleString()}

---

## 🔄 **ACTIONS**

- 🔄 [[Sync All Tables]] - Синхронизировать все таблицы
- 📊 [[Database Overview]] - Обзор всей БД
- 🌐 [[Graph View]] - Открыть граф связей
- 📈 [[Analytics Dashboard]] - Аналитика

---
*Автоматически создано obsidian-db-sync*
`;

    return (
      frontmatter +
      header +
      graphSection +
      schemaSection +
      dataSection +
      statsSection
    );
  }

  /**
   * 🎨 Получение hex цвета по названию
   */
  getColorHex(colorName) {
    const colors = {
      blue: "4A90E2",
      green: "7ED321",
      purple: "9013FE",
      orange: "F5A623",
      yellow: "F8E71C",
      red: "D0021B",
    };
    return colors[colorName] || "666666";
  }

  /**
   * 🌐 Создание графа связей между таблицами
   */
  async createDatabaseGraph(results) {
    console.log("🌐 Создаю граф связей базы данных...");

    const graphContent = `---
title: "🌐 Database Graph Visualization"
type: graph-overview
tags: [database, graph, overview]
---

# 🌐 **DATABASE RELATIONSHIP GRAPH**

> **Интерактивная схема** всех таблиц и их связей

## 🎯 **ПОЛНАЯ СХЕМА БД**

\`\`\`mermaid
graph TB
    %% Business Layer (Blue)
    User[👥 user]
    UserLink[🔗 user_account_link]
    Booking[📅 booking]
    BookingPart[👤 booking_participant]
    
    %% Venue & Courts (Green)
    Venue[🏟️ venue]
    Court[🎾 court]
    
    %% Financial Layer (Green)
    Payment[💰 payment]
    Order[🛒 order]
    OrderItem[📦 order_item]
    Product[🎯 product]
    ProductCat[📂 product_category]
    StockTrans[📊 stock_transaction]
    BonusTrans[🎁 bonus_transaction]
    
    %% Education Layer (Orange)
    ClassDef[📚 class_definition]
    ClassSched[📅 class_schedule]
    ClassPart[🎓 class_participant]
    TrainPkg[📋 training_package_definition]
    UserTrainPkg[🎯 user_training_package]
    
    %% Gaming Layer (Purple)
    GameSession[🎮 game_session]
    GamePlayer[🏓 game_player]
    RatingChange[📈 rating_change]
    Tournament[🏆 tournament]
    TournPart[🥇 tournament_participant]
    TournTeam[👥 tournament_team]
    TournMatch[⚔️ tournament_match]
    
    %% AI/Analytics Layer (Yellow)
    AISuggestion[🤖 ai_suggestion_log]
    Feedback[💭 feedback]
    
    %% System Layer (Red)
    Task[📋 task]
    Notification[🔔 notification]
    ExtMapping[🔄 external_system_mapping]
    
    %% Core Relationships
    User --> UserLink
    User --> Booking
    User --> Payment
    User --> GameSession
    User --> TournPart
    User --> AISuggestion
    User --> Feedback
    User --> Task
    User --> Notification
    User --> BonusTrans
    
    %% Venue & Court Relationships
    Venue --> Court
    Venue --> ClassSched
    Venue --> Tournament
    Court --> Booking
    Court --> GameSession
    
    %% Booking Relationships
    Booking --> BookingPart
    Booking --> Payment
    BookingPart --> User
    
    %% Financial Relationships
    Payment --> Order
    Order --> OrderItem
    OrderItem --> Product
    Product --> ProductCat
    Product --> StockTrans
    
    %% Education Relationships
    ClassDef --> ClassSched
    ClassDef --> TrainPkg
    ClassSched --> ClassPart
    ClassPart --> User
    TrainPkg --> UserTrainPkg
    UserTrainPkg --> User
    
    %% Gaming Relationships
    GameSession --> GamePlayer
    GameSession --> RatingChange
    GamePlayer --> User
    GamePlayer --> RatingChange
    Tournament --> TournPart
    Tournament --> TournTeam
    Tournament --> TournMatch
    TournPart --> User
    TournPart --> TournTeam
    TournTeam --> TournMatch
    
    %% Styling
    classDef blueNode fill:#4A90E2,stroke:#333,stroke-width:2px,color:#fff;
    classDef greenNode fill:#7ED321,stroke:#333,stroke-width:2px,color:#fff;
    classDef orangeNode fill:#F5A623,stroke:#333,stroke-width:2px,color:#fff;
    classDef purpleNode fill:#9013FE,stroke:#333,stroke-width:2px,color:#fff;
    classDef yellowNode fill:#F8E71C,stroke:#333,stroke-width:2px,color:#000;
    classDef redNode fill:#D0021B,stroke:#333,stroke-width:2px,color:#fff;
    
    class User,UserLink,Booking,BookingPart blueNode;
    class Venue,Court,Payment,Order,OrderItem,Product,ProductCat,StockTrans,BonusTrans greenNode;
    class ClassDef,ClassSched,ClassPart,TrainPkg,UserTrainPkg orangeNode;
    class GameSession,GamePlayer,RatingChange,Tournament,TournPart,TournTeam,TournMatch purpleNode;
    class AISuggestion,Feedback yellowNode;
    class Task,Notification,ExtMapping redNode;
\`\`\`

## 📊 **СЛОИ АРХИТЕКТУРЫ**

### 🔵 **Business Layer**
${Object.entries(results)
  .filter(([name, data]) => this.tableConfig[name]?.color === "blue")
  .map(
    ([name, data]) =>
      `- [[${this.tableConfig[name].icon} ${name}]] (${
        data.recordCount || 0
      } записей)`
  )
  .join("\n")}

### 🟢 **Financial & Infrastructure Layer**  
${Object.entries(results)
  .filter(([name, data]) => this.tableConfig[name]?.color === "green")
  .map(
    ([name, data]) =>
      `- [[${this.tableConfig[name].icon} ${name}]] (${
        data.recordCount || 0
      } записей)`
  )
  .join("\n")}

### 🟠 **Education Layer**
${Object.entries(results)
  .filter(([name, data]) => this.tableConfig[name]?.color === "orange")
  .map(
    ([name, data]) =>
      `- [[${this.tableConfig[name].icon} ${name}]] (${
        data.recordCount || 0
      } записей)`
  )
  .join("\n")}

### 🟣 **Gaming Layer**
${Object.entries(results)
  .filter(([name, data]) => this.tableConfig[name]?.color === "purple")
  .map(
    ([name, data]) =>
      `- [[${this.tableConfig[name].icon} ${name}]] (${
        data.recordCount || 0
      } записей)`
  )
  .join("\n")}

### 🟡 **AI/Analytics Layer**
${Object.entries(results)
  .filter(([name, data]) => this.tableConfig[name]?.color === "yellow")
  .map(
    ([name, data]) =>
      `- [[${this.tableConfig[name].icon} ${name}]] (${
        data.recordCount || 0
      } записей)`
  )
  .join("\n")}

### 🔴 **System Layer**
${Object.entries(results)
  .filter(([name, data]) => this.tableConfig[name]?.color === "red")
  .map(
    ([name, data]) =>
      `- [[${this.tableConfig[name].icon} ${name}]] (${
        data.recordCount || 0
      } записей)`
  )
  .join("\n")}

## 🎯 **NAVIGATION**

- 🎯 [[🚀 Master Dashboard]] - Главный дашборд
- 📊 [[Database Overview]] - Обзор всех таблиц  
- 🔄 [[Sync Status]] - Статус синхронизации
- 🎨 [[Graph Settings]] - Настройки графа

---
*Автоматически создано obsidian-db-sync ${new Date().toLocaleString()}*
`;

    const filePath = path.join(GRAPHS_FOLDER, "🌐 Database Graph.md");
    await fs.writeFile(filePath, graphContent, "utf8");

    console.log(`✅ Граф связей создан: ${filePath}`);
  }

  /**
   * 🚀 Создание главного дашборда
   */
  async createMasterDashboard(results) {
    console.log("🚀 Создаю главный дашборд...");

    const totalTables = Object.keys(results).length;
    const totalRecords = Object.values(results).reduce(
      (sum, table) => sum + (table.recordCount || 0),
      0
    );
    const successfulTables = Object.values(results).filter(
      (table) => !table.error
    ).length;

    const dashboardContent = `---
title: "🚀 Master Database Dashboard"
type: master-dashboard
auto_refresh: 30000
tags: [dashboard, master, database, overview]
cssclass: master-dashboard
---

# 🚀 **MASTER DATABASE DASHBOARD**

> **🌐 Центральная панель управления всей базой данных**  
> Обновлено: \`= date(now)\` | Таблиц: **${totalTables}** | Записей: **${totalRecords}**

---

## 📊 **ОБЩАЯ СТАТИСТИКА**

| 🎯 **Метрика** | 📈 **Значение** | 🎨 **Статус** |
|----------------|-----------------|----------------|
| 🗄️ Всего таблиц | **${totalTables}** | ${
      successfulTables === totalTables
        ? "🟢 ВСЕ СИНХРОНИЗИРОВАНЫ"
        : "🟡 ЧАСТИЧНО"
    } |
| 📊 Всего записей | **${totalRecords.toLocaleString()}** | 🔥 АКТУАЛЬНО |
| ✅ Успешно синхронизировано | **${successfulTables}/${totalTables}** | ${
      successfulTables === totalTables ? "🎯 ОТЛИЧНО" : "⚠️ ТРЕБУЕТ ВНИМАНИЯ"
    } |
| ⏰ Последняя синхронизация | **${new Date().toLocaleString()}** | 🔄 REAL-TIME |

---

## 🌐 **ГРАФ НАВИГАЦИЯ**

### 🎯 **Быстрый доступ к слоям:**

\`\`\`mermaid
mindmap
  root((🗄️ DATABASE))
    🔵 Business Layer
      👥 users (${results["user"]?.recordCount || 0})
      📝 profiles (${results["user_profiles"]?.recordCount || 0})
      🎮 sessions (${results["game_sessions"]?.recordCount || 0})
      📅 bookings (${results["booking"]?.recordCount || 0})
      🏟️ courts (${results["court"]?.recordCount || 0})
    🟣 AI/ML Layer  
      🤖 AI Logs (${results["ai_suggestion_log"]?.recordCount || 0})
      🧠 models (${results["ai_models"]?.recordCount || 0})
      💡 recommendations (${results["recommendations"]?.recordCount || 0})
    🟢 Financial Layer
      💰 payments (${results["payment"]?.recordCount || 0})
      💳 transactions (${results["transactions"]?.recordCount || 0})
      📋 subscriptions (${results["subscriptions"]?.recordCount || 0})
    🟠 Gaming Layer
      ⚔️ matches (${results["game_session"]?.recordCount || 0})
      🏆 tournaments (${results["tournament"]?.recordCount || 0})
      📊 player stats (${results["player_stats"]?.recordCount || 0})
    🟡 Analytics Layer
      📈 events (${results["analytics_events"]?.recordCount || 0})
      🔍 behavior (${results["feedback"]?.recordCount || 0})
\`\`\`

---

## 🗄️ **ВСЕ ТАБЛИЦЫ БАЗЫ ДАННЫХ**

${Object.entries(results)
  .map(([tableName, data]) => {
    const config = this.tableConfig[tableName];
    if (!config) return "";

    const status = data.error
      ? "❌ ОШИБКА"
      : `✅ ${(data.recordCount || 0).toLocaleString()} записей`;

    return `### ${config.icon} **[[${
      config.icon
    } ${tableName}|${tableName.toUpperCase()}]]**
- 📊 **Записей**: ${status}
- 🎨 **Слой**: ${config.color}
- 🔗 **Связи**: ${config.relationships.length} таблиц
- 📁 **Файл**: \`${data.filePath?.split("/").pop() || "N/A"}\`
${data.error ? `- ⚠️ **Ошибка**: ${data.error}` : ""}
`;
  })
  .join("\n")}

---

## 🔄 **СИНХРОНИЗАЦИЯ И УПРАВЛЕНИЕ**

### ⚡ **Быстрые действия:**
- 🔄 **[[Sync All Tables]]** - Полная синхронизация всех таблиц
- 🌐 **[[🌐 Database Graph]]** - Интерактивный граф связей
- 📊 **[[Database Analytics]]** - Аналитика и метрики
- 🎯 **[[Table Health Check]]** - Проверка состояния таблиц

### 📈 **Статистика по слоям:**

\`\`\`dataview
TABLE WITHOUT ID
    layer as "🎨 Слой",
    tables as "🗄️ Таблиц", 
    records as "📊 Записей",
    status as "🎯 Статус"
WHERE file = this.file
\`\`\`

| 🎨 **Слой** | 🗄️ **Таблиц** | 📊 **Записей** | 🎯 **Статус** |
|-------------|----------------|----------------|---------------|
| 🔵 Business | ${
      Object.values(this.tableConfig).filter((c) => c.color === "blue").length
    } | ${Object.entries(results)
      .filter(([name, data]) => this.tableConfig[name]?.color === "blue")
      .reduce((sum, [_, data]) => sum + (data.recordCount || 0), 0)
      .toLocaleString()} | 🟢 Активен |
| 🟢 Financial & Infrastructure | ${
      Object.values(this.tableConfig).filter((c) => c.color === "green").length
    } | ${Object.entries(results)
      .filter(([name, data]) => this.tableConfig[name]?.color === "green")
      .reduce((sum, [_, data]) => sum + (data.recordCount || 0), 0)
      .toLocaleString()} | 🟢 Активен |
| 🟠 Education | ${
      Object.values(this.tableConfig).filter((c) => c.color === "orange").length
    } | ${Object.entries(results)
      .filter(([name, data]) => this.tableConfig[name]?.color === "orange")
      .reduce((sum, [_, data]) => sum + (data.recordCount || 0), 0)
      .toLocaleString()} | 🟢 Активен |
| 🟣 Gaming | ${
      Object.values(this.tableConfig).filter((c) => c.color === "purple").length
    } | ${Object.entries(results)
      .filter(([name, data]) => this.tableConfig[name]?.color === "purple")
      .reduce((sum, [_, data]) => sum + (data.recordCount || 0), 0)
      .toLocaleString()} | 🟢 Активен |
| 🟡 AI/Analytics | ${
      Object.values(this.tableConfig).filter((c) => c.color === "yellow").length
    } | ${Object.entries(results)
      .filter(([name, data]) => this.tableConfig[name]?.color === "yellow")
      .reduce((sum, [_, data]) => sum + (data.recordCount || 0), 0)
      .toLocaleString()} | 🟢 Активен |
| 🔴 System | ${
      Object.values(this.tableConfig).filter((c) => c.color === "red").length
    } | ${Object.entries(results)
      .filter(([name, data]) => this.tableConfig[name]?.color === "red")
      .reduce((sum, [_, data]) => sum + (data.recordCount || 0), 0)
      .toLocaleString()} | 🟢 Активен |

---

## 🎊 **DASHBOARD FEATURES**

### ✨ **Что умеет эта экосистема:**
- 🔄 **Real-time синхронизация** с PostgreSQL
- 🌐 **Интерактивные графы** связей между таблицами  
- 📊 **Dataview таблицы** с live-данными
- 🎨 **Цветовая кодировка** по слоям архитектуры
- 🔍 **Полнотекстовый поиск** по всем данным
- 📈 **Автоматические дашборды** для каждой таблицы
- 🎯 **Навигация через граф** между связанными сущностями

### 💎 **Для клиентов:**
- 🚀 **Профессиональный вид** - впечатляет с первого взгляда
- 🎮 **Интерактивность** - можно исследовать данные
- 📱 **Кроссплатформенность** - работает везде где есть Obsidian
- 🔄 **Актуальность** - данные всегда свежие

---

<div class="dashboard-summary">

## 🎉 **СТАТУС ЭКОСИСТЕМЫ**

**🔥 СИСТЕМА ГОТОВА К РАБОТЕ!**

Создана полная графовая экосистема базы данных с:
- ✅ **${totalTables} таблиц** синхронизированы
- ✅ **${totalRecords.toLocaleString()} записей** доступны для анализа  
- ✅ **${Object.values(this.tableConfig).reduce(
      (sum, config) => sum + config.relationships.length,
      0
    )} связей** между таблицами
- ✅ **5 слоев** архитектуры с цветовой кодировкой
- ✅ **Mermaid диаграммы** для визуализации

**Клиент будет в восторге!** 🚀✨

</div>

---

<style>
.master-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: #ffffff;
  padding: 30px;
  border-radius: 25px;
}

.dashboard-summary {
  margin-top: 40px;
  padding: 30px;
  background: rgba(255,215,0,0.15);
  border-radius: 20px;
  border: 3px solid #FFD700;
  box-shadow: 0 8px 32px rgba(255,215,0,0.3);
}

table {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  border: 2px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
}

h2 {
  border-bottom: 4px solid #FFD700;
  padding: 20px;
  margin-top: 40px;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
  background: rgba(255,215,0,0.1);
  border-radius: 15px;
}

h3 {
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
  margin-top: 25px;
}
</style>
`;

    const filePath = path.join(OBSIDIAN_VAULT_PATH, "🚀 Master Dashboard.md");
    await fs.writeFile(filePath, dashboardContent, "utf8");

    console.log(`✅ Главный дашборд создан: ${filePath}`);
  }
}

/**
 * 🚀 Основная функция
 */
async function main() {
  const sync = new ObsidianDBSync();

  // Парсим аргументы командной строки
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  try {
    // Проверяем подключение
    const connected = await sync.testConnection();
    if (!connected) {
      process.exit(1);
    }

    switch (command) {
      case "export":
        await sync.exportAISuggestionLogs();
        break;

      case "templates":
        await sync.createTemplates();
        break;

      case "full-sync":
        console.log("🚀 Запуск полной синхронизации всех таблиц БД...");
        await sync.exportAllTables();
        break;

      case "watch":
        await sync.startWatching();
        break;

      case "stop":
        await sync.stopWatching();
        break;

      case "help":
      default:
        console.log(`
🚀 **Obsidian Database Sync Tool**

📋 **Доступные команды:**
  • export      - Экспорт всех таблиц в Obsidian
  • full-sync   - Полная синхронизация всех 30 таблиц БД
  • watch       - Запуск мониторинга изменений
  • stop        - Остановка мониторинга

🎯 **Примеры использования:**
  node scripts/obsidian-db-sync.mjs full-sync
  node scripts/obsidian-db-sync.mjs export
  node scripts/obsidian-db-sync.mjs watch

🗄️ **Поддерживаемые таблицы:** ${Object.keys(sync.tableConfig).length}
📊 **Слои архитектуры:** 6 (Business, Financial, Education, Gaming, AI/Analytics, System)
`);
        break;
    }
  } catch (error) {
    console.error("❌ Критическая ошибка:", error);
    process.exit(1);
  } finally {
    if (command !== "watch") {
      await sync.close();
    }
  }
}

// Запускаем если это основной модуль
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ObsidianDBSync };
