#!/usr/bin/env node

/**
 * 🎭 Создание демо-данных для всех пропущенных моделей
 * Создает файлы Obsidian для моделей, которые не синхронизируются
 */

import fs from 'fs/promises';
import path from 'path';

const DATABASE_FOLDER = 'oxygen-world/Database';

class MissingModelsDemo {
  constructor() {
    // 🎯 Пропущенные модели для создания демо-данных
    this.missingModels = {
      // 🎮 Gaming Layer
      game_session: {
        icon: "🎮",
        displayName: "Game Session",
        filePrefix: "Game-Session",
        demoData: [
          {
            id: "game-001",
            court_name: "Tennis Court",
            host_name: "David Smith",
            game_type: "singles",
            status: "active",
            max_players: 2,
            current_players: 2,
            start_time: "2025-01-31T15:00:00Z",
            end_time: "2025-01-31T16:00:00Z"
          },
          {
            id: "game-002", 
            court_name: "Padel Court",
            host_name: "Anna Johnson",
            game_type: "doubles",
            status: "completed",
            max_players: 4,
            current_players: 4,
            start_time: "2025-01-31T14:00:00Z",
            end_time: "2025-01-31T15:00:00Z"
          }
        ]
      },
      
      tournament: {
        icon: "🏆",
        displayName: "Tournament",
        filePrefix: "Tournament",
        demoData: [
          {
            id: "tournament-001",
            name: "Monthly Tennis Championship",
            venue_name: "Phangan Padel Tennis Club",
            tournament_type: "singles",
            status: "upcoming",
            start_date: "2025-02-15",
            end_date: "2025-02-16",
            max_participants: 16,
            entry_fee: 1000,
            prize_pool: 10000
          },
          {
            id: "tournament-002",
            name: "Padel Doubles Cup",
            venue_name: "Phangan Padel Tennis Club", 
            tournament_type: "doubles",
            status: "registration_open",
            start_date: "2025-03-01",
            end_date: "2025-03-02",
            max_participants: 32,
            entry_fee: 800,
            prize_pool: 15000
          }
        ]
      },
      
      task: {
        icon: "📋",
        displayName: "Task",
        filePrefix: "Task",
        demoData: [
          {
            id: "task-001",
            title: "Court Maintenance - Tennis",
            description: "Weekly maintenance of tennis court surface and nets",
            assigned_to: "Maintenance Team",
            status: "in_progress",
            priority: "high",
            due_date: "2025-02-01",
            venue_name: "Phangan Padel Tennis Club"
          },
          {
            id: "task-002",
            title: "Equipment Inventory Check",
            description: "Monthly inventory check of all tennis and padel equipment",
            assigned_to: "Club Manager",
            status: "pending",
            priority: "medium", 
            due_date: "2025-02-05",
            venue_name: "Phangan Padel Tennis Club"
          },
          {
            id: "task-003",
            title: "Lighting System Upgrade",
            description: "Install LED lighting system for night games",
            assigned_to: "Technical Team",
            status: "planning",
            priority: "low",
            due_date: "2025-02-15",
            venue_name: "Phangan Padel Tennis Club"
          }
        ]
      },
      
      notification: {
        icon: "🔔",
        displayName: "Notification",
        filePrefix: "Notification",
        demoData: [
          {
            id: "notif-001",
            user_name: "David Smith",
            type: "booking_reminder",
            title: "Booking Reminder",
            message: "Your tennis court booking starts in 30 minutes",
            is_read: false,
            created_at: "2025-01-31T14:30:00Z"
          },
          {
            id: "notif-002",
            user_name: "Anna Johnson",
            type: "tournament_update",
            title: "Tournament Registration",
            message: "Registration for Monthly Tennis Championship is now open",
            is_read: true,
            created_at: "2025-01-30T10:00:00Z"
          }
        ]
      },
      
      class_participant: {
        icon: "🎓",
        displayName: "Class Participant",
        filePrefix: "Class-Participant",
        demoData: [
          {
            id: "participant-001",
            class_name: "Tennis for Beginners",
            user_name: "Sarah Brown",
            enrollment_date: "2025-01-15",
            status: "active",
            attendance_count: 8,
            progress_notes: "Excellent progress in forehand technique"
          },
          {
            id: "participant-002",
            class_name: "Padel for Women",
            user_name: "Maria Rodriguez",
            enrollment_date: "2025-01-20",
            status: "active", 
            attendance_count: 6,
            progress_notes: "Great improvement in serve accuracy"
          }
        ]
      },
      
      training_package: {
        icon: "📦",
        displayName: "Training Package",
        filePrefix: "Training-Package",
        demoData: [
          {
            id: "package-001",
            name: "VIP Tennis Training",
            description: "Intensive tennis training with personal coach",
            duration_weeks: 12,
            sessions_per_week: 3,
            price: 15000,
            skill_level: "intermediate"
          },
          {
            id: "package-002",
            name: "Padel Fundamentals",
            description: "Learn padel basics in small groups",
            duration_weeks: 8,
            sessions_per_week: 2,
            price: 8000,
            skill_level: "beginner"
          }
        ]
      }
    };
  }

  async createAllMissingModels() {
    console.log('🎭 Создаю демо-данные для всех пропущенных моделей...');
    console.log(`📊 Всего моделей: ${Object.keys(this.missingModels).length}`);
    
    await this.ensureDirectoryExists(DATABASE_FOLDER);
    
    let totalFiles = 0;
    
    for (const [modelName, config] of Object.entries(this.missingModels)) {
      console.log(`\n🔄 Создаю: ${config.icon} ${config.displayName}`);
      
      // Создаем файлы для каждой записи
      for (const [index, data] of config.demoData.entries()) {
        await this.createModelFile(modelName, config, data, index);
        totalFiles++;
      }
      
      // Создаем сводный файл
      await this.createSummaryFile(modelName, config);
      totalFiles++;
      
      console.log(`✅ ${config.displayName}: ${config.demoData.length + 1} файлов создано`);
    }
    
    console.log(`\n🎉 Создание завершено!`);
    console.log(`📁 Всего файлов создано: ${totalFiles}`);
    console.log(`🧠 "Второй Мозг" теперь содержит все модели!`);
  }

  async createModelFile(modelName, config, data, index) {
    const fileName = this.generateFileName(config, data, index);
    const content = this.generateFileContent(modelName, config, data);
    const filePath = path.join(DATABASE_FOLDER, fileName);
    
    await fs.writeFile(filePath, content, 'utf8');
  }

  generateFileName(config, data, index) {
    const name = data.name || data.title || `${config.displayName}-${index + 1}`;
    const cleanName = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
    return `${config.filePrefix}-${cleanName}.md`;
  }

  generateFileContent(modelName, config, data) {
    const title = data.name || data.title || `${config.displayName} ${data.id}`;
    
    return `---
title: "${title}"
table_name: "${modelName}"
sync_source: "demo_data"
last_sync: "${new Date().toISOString()}"
demo_id: "${data.id}"
tags: [${modelName}, demo_data, ${config.displayName.toLowerCase().replace(/\s+/g, '_')}]
created_at: "${data.created_at || new Date().toISOString()}"
---

# ${config.icon} ${title}

## 📋 Информация

${Object.entries(data).map(([key, value]) => 
  `- **${this.formatFieldName(key)}**: \`${value}\``
).join('\n')}

## 🔗 Связи в "Втором Мозге"

### 🧠 **Модель**
- [[Technical/🧠 MODEL - ${config.displayName}|🧠 ${config.displayName} Model]]

### 📊 **Данные**
- [[${config.displayName.replace(/\s+/g, '-')}-Data|📊 Все ${config.displayName}]]

### 🏠 **Дашборды**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

${this.generateSpecificLinks(modelName, data)}

---

*🎭 Демо-данные для "Второго Мозга"*
*🧠 Часть архитектуры базы данных*
*🏝️ Phangan Padel Tennis Club - Connected Intelligence*`;
  }

  generateSpecificLinks(modelName, data) {
    switch (modelName) {
      case 'game_session':
        return `
### 🎮 **Игровые связи**
- [[Court-${data.court_name?.replace(/\s+/g, '-')}|🏓 ${data.court_name}]]
- [[User-${data.host_name?.replace(/\s+/g, '-')}|👤 ${data.host_name}]]`;
        
      case 'tournament':
        return `
### 🏆 **Турнирные связи**
- [[Venue-${data.venue_name?.replace(/\s+/g, '-')}|🏠 ${data.venue_name}]]`;
        
      case 'task':
        return `
### 📋 **Рабочие связи**
- [[Venue-${data.venue_name?.replace(/\s+/g, '-')}|🏠 ${data.venue_name}]]`;
        
      case 'notification':
        return `
### 🔔 **Уведомления**
- [[User-${data.user_name?.replace(/\s+/g, '-')}|👤 ${data.user_name}]]`;
        
      case 'class_participant':
        return `
### 🎓 **Обучение**
- [[Class-${data.class_name?.replace(/\s+/g, '-')}|📚 ${data.class_name}]]
- [[User-${data.user_name?.replace(/\s+/g, '-')}|👤 ${data.user_name}]]`;
        
      default:
        return '';
    }
  }

  formatFieldName(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  async createSummaryFile(modelName, config) {
    const content = `---
title: "${config.displayName} Data"
table_name: "${modelName}"
sync_source: "demo_data"
last_sync: "${new Date().toISOString()}"
tags: [${modelName}, data, summary, demo_data]
---

# ${config.icon} ${config.displayName} Data

## 📊 Сводка

- **Всего записей**: ${config.demoData.length}
- **Последнее обновление**: ${new Date().toLocaleString()}
- **Тип данных**: Демо-данные
- **Модель БД**: \`${modelName}\`

## 📋 Все ${config.displayName}

${config.demoData.map((data, index) => {
  const name = data.name || data.title || `${config.displayName} ${index + 1}`;
  const fileName = this.generateFileName(config, data, index);
  return `- [[${fileName.replace('.md', '')}|${config.icon} ${name}]]`;
}).join('\n')}

## 🔗 Связи

### 🧠 **Модель**
- [[Technical/🧠 MODEL - ${config.displayName}|🧠 ${config.displayName} Model]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

## 📈 **Статистика**

\`\`\`dataview
TABLE
  sync_source as "🔗 Источник",
  created_at as "📅 Создано"
FROM "oxygen-world/Database"
WHERE contains(file.name, "${config.filePrefix}")
SORT created_at desc
\`\`\`

---

*🎭 Демо-данные для "Второго Мозга"*
*🧠 Часть архитектуры базы данных*`;

    const fileName = `${config.displayName.replace(/\s+/g, '-')}-Data.md`;
    const filePath = path.join(DATABASE_FOLDER, fileName);
    await fs.writeFile(filePath, content, 'utf8');
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Папка уже существует
    }
  }
}

// Запуск создания демо-данных
async function main() {
  const demo = new MissingModelsDemo();
  
  try {
    await demo.createAllMissingModels();
  } catch (error) {
    console.error('❌ Ошибка создания демо-данных:', error);
  }
}

// Запуск если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MissingModelsDemo;
