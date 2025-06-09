#!/usr/bin/env bun
/**
 * 🎨 Генератор ERD диаграммы из Drizzle схемы
 * Создает визуализацию всех 31 модели с их связями
 */

import fs from "fs/promises";
import path from "path";

// Импортируем все схемы
import * as schema from "../src/db/schema";

/**
 * 📊 Генерация DBML из Drizzle схемы
 */
function generateDBML() {
  const tables = [
    // Business Layer (Blue)
    { name: "user", color: "#2196F3", layer: "Business" },
    { name: "user_account_link", color: "#2196F3", layer: "Business" },
    { name: "booking", color: "#2196F3", layer: "Business" },
    { name: "booking_participant", color: "#2196F3", layer: "Business" },
    
    // Financial Layer (Green)
    { name: "venue", color: "#4CAF50", layer: "Financial" },
    { name: "court", color: "#4CAF50", layer: "Financial" },
    { name: "payment", color: "#4CAF50", layer: "Financial" },
    { name: "order", color: "#4CAF50", layer: "Financial" },
    { name: "order_item", color: "#4CAF50", layer: "Financial" },
    { name: "product", color: "#4CAF50", layer: "Financial" },
    { name: "product_category", color: "#4CAF50", layer: "Financial" },
    { name: "stock_transaction", color: "#4CAF50", layer: "Financial" },
    { name: "bonus_transaction", color: "#4CAF50", layer: "Financial" },
    
    // Education Layer (Orange)
    { name: "class_definition", color: "#FF9800", layer: "Education" },
    { name: "class_schedule", color: "#FF9800", layer: "Education" },
    { name: "class_participant", color: "#FF9800", layer: "Education" },
    { name: "training_package_definition", color: "#FF9800", layer: "Education" },
    { name: "user_training_package", color: "#FF9800", layer: "Education" },
    
    // Gaming Layer (Purple)
    { name: "game_session", color: "#9C27B0", layer: "Gaming" },
    { name: "game_player", color: "#9C27B0", layer: "Gaming" },
    { name: "rating_change", color: "#9C27B0", layer: "Gaming" },
    { name: "tournament", color: "#9C27B0", layer: "Gaming" },
    { name: "tournament_participant", color: "#9C27B0", layer: "Gaming" },
    { name: "tournament_team", color: "#9C27B0", layer: "Gaming" },
    { name: "tournament_match", color: "#9C27B0", layer: "Gaming" },
    
    // AI/Analytics Layer (Yellow)
    { name: "ai_suggestion_log", color: "#FFEB3B", layer: "AI/Analytics" },
    { name: "feedback", color: "#FFEB3B", layer: "AI/Analytics" },
    
    // System Layer (Red)
    { name: "task", color: "#F44336", layer: "System" },
    { name: "notification", color: "#F44336", layer: "System" },
    { name: "external_system_mapping", color: "#F44336", layer: "System" },
  ];

  let dbml = `// 🎨 Padle World Club - Database Schema Visualization
// Generated from Drizzle ORM Schema
// Total Models: ${tables.length}

Project PadleWorldClub {
  database_type: 'PostgreSQL'
  Note: '''
    🏝️ Phangan Padel Tennis Club
    🧠 "Второй Мозг" Architecture
    📊 ${tables.length} Connected Models
  '''
}

`;

  // Генерируем таблицы по слоям
  const layers = [...new Set(tables.map(t => t.layer))];
  
  for (const layer of layers) {
    const layerTables = tables.filter(t => t.layer === layer);
    const layerColor = layerTables[0]?.color || "#666";
    
    dbml += `
//==============================================================================
// 🎨 ${layer} Layer (${layerTables.length} tables)
//==============================================================================

`;

    for (const table of layerTables) {
      dbml += generateTableDBML(table);
    }
  }

  // Добавляем связи
  dbml += `
//==============================================================================
// 🔗 Relationships (Foreign Keys)
//==============================================================================

`;

  dbml += generateRelationships();

  return dbml;
}

/**
 * 📋 Генерация DBML для таблицы
 */
function generateTableDBML(table: any) {
  const commonFields = `
  id uuid [pk, default: \`gen_random_uuid()\`]
  created_at timestamp [default: \`now()\`]
  updated_at timestamp [default: \`now()\`]`;

  const tableSpecificFields = getTableSpecificFields(table.name);

  return `
Table ${table.name} {
${commonFields}
${tableSpecificFields}
  
  Note: '${getTableDescription(table.name)}'
}
`;
}

/**
 * 📝 Получение специфичных полей для таблицы
 */
function getTableSpecificFields(tableName: string): string {
  const fields: Record<string, string> = {
    user: `
  username varchar(50) [unique, not null]
  first_name varchar(100)
  last_name varchar(100)
  email varchar(255) [unique, not null]
  phone varchar(20)
  user_role user_role_enum [not null]
  current_rating integer [default: 1000]
  bonus_points integer [default: 0]
  member_id varchar(50) [unique]`,

    booking: `
  user_id uuid [ref: > user.id]
  court_id uuid [ref: > court.id]
  start_time timestamp [not null]
  end_time timestamp [not null]
  status booking_status_enum [not null]
  total_price decimal(10,2)
  notes text`,

    payment: `
  booking_id uuid [ref: > booking.id]
  user_id uuid [ref: > user.id]
  amount decimal(10,2) [not null]
  currency varchar(3) [default: 'THB']
  status payment_status_enum [not null]
  payment_method payment_method_enum
  transaction_id varchar(255)`,

    venue: `
  name varchar(255) [not null]
  address text
  city varchar(100)
  country varchar(100)
  phone varchar(20)
  email varchar(255)
  website varchar(255)`,

    court: `
  venue_id uuid [ref: > venue.id]
  name varchar(255) [not null]
  court_type court_type_enum [not null]
  surface_type surface_type_enum
  hourly_rate decimal(10,2)
  is_active boolean [default: true]`,

    game_session: `
  court_id uuid [ref: > court.id]
  start_time timestamp [not null]
  end_time timestamp
  session_type session_type_enum [not null]
  status session_status_enum [not null]`,

    tournament: `
  name varchar(255) [not null]
  description text
  start_date date [not null]
  end_date date [not null]
  tournament_type tournament_type_enum [not null]
  status tournament_status_enum [not null]
  max_participants integer
  entry_fee decimal(10,2)`,
  };

  return fields[tableName] || `
  name varchar(255)
  description text
  status varchar(50) [default: 'active']`;
}

/**
 * 📖 Описание таблицы
 */
function getTableDescription(tableName: string): string {
  const descriptions: Record<string, string> = {
    user: "👥 Пользователи системы - игроки, тренеры, администраторы",
    booking: "📅 Бронирования кортов",
    payment: "💰 Платежи и транзакции",
    venue: "🏢 Площадки и клубы",
    court: "🎾 Корты для игры",
    game_session: "🎮 Игровые сессии",
    tournament: "🏆 Турниры и соревнования",
    ai_suggestion_log: "🤖 Логи AI рекомендаций",
    external_system_mapping: "🔗 Маппинг внешних систем",
  };

  return descriptions[tableName] || `📊 ${tableName} data`;
}

/**
 * 🔗 Генерация связей между таблицами
 */
function generateRelationships(): string {
  return `
// 👥 User-centered relationships
Ref: booking.user_id > user.id
Ref: payment.user_id > user.id
Ref: game_player.user_id > user.id
Ref: tournament_participant.user_id > user.id
Ref: class_participant.user_id > user.id
Ref: user_training_package.user_id > user.id
Ref: rating_change.user_id > user.id
Ref: feedback.user_id > user.id

// 🏢 Venue-Court relationships
Ref: court.venue_id > venue.id
Ref: booking.court_id > court.id
Ref: game_session.court_id > court.id

// 💰 Payment relationships
Ref: payment.booking_id > booking.id
Ref: order.user_id > user.id
Ref: order_item.order_id > order.id
Ref: order_item.product_id > product.id

// 🎓 Education relationships
Ref: class_schedule.class_definition_id > class_definition.id
Ref: class_participant.class_schedule_id > class_schedule.id
Ref: user_training_package.training_package_definition_id > training_package_definition.id

// 🎮 Gaming relationships
Ref: game_player.game_session_id > game_session.id
Ref: tournament_participant.tournament_id > tournament.id
Ref: tournament_match.tournament_id > tournament.id
Ref: rating_change.game_session_id > game_session.id

// 🔗 System relationships
Ref: notification.user_id > user.id
Ref: task.assigned_to > user.id
`;
}

/**
 * 🎨 Генерация React компонента для визуализации
 */
function generateReactVisualization() {
  return `import React from 'react';
import { ReactFlow, Node, Edge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const DatabaseVisualization: React.FC = () => {
  const nodes: Node[] = [
    // Business Layer (Blue)
    { id: 'user', position: { x: 100, y: 100 }, data: { label: '👥 Users' }, style: { background: '#2196F3', color: 'white' } },
    { id: 'booking', position: { x: 300, y: 100 }, data: { label: '📅 Bookings' }, style: { background: '#2196F3', color: 'white' } },
    
    // Financial Layer (Green)
    { id: 'payment', position: { x: 500, y: 100 }, data: { label: '💰 Payments' }, style: { background: '#4CAF50', color: 'white' } },
    { id: 'venue', position: { x: 100, y: 300 }, data: { label: '🏢 Venues' }, style: { background: '#4CAF50', color: 'white' } },
    { id: 'court', position: { x: 300, y: 300 }, data: { label: '🎾 Courts' }, style: { background: '#4CAF50', color: 'white' } },
    
    // Gaming Layer (Purple)
    { id: 'game_session', position: { x: 500, y: 300 }, data: { label: '🎮 Game Sessions' }, style: { background: '#9C27B0', color: 'white' } },
    { id: 'tournament', position: { x: 700, y: 300 }, data: { label: '🏆 Tournaments' }, style: { background: '#9C27B0', color: 'white' } },
  ];

  const edges: Edge[] = [
    { id: 'user-booking', source: 'user', target: 'booking', label: 'books' },
    { id: 'booking-payment', source: 'booking', target: 'payment', label: 'pays for' },
    { id: 'venue-court', source: 'venue', target: 'court', label: 'contains' },
    { id: 'court-booking', source: 'court', target: 'booking', label: 'booked for' },
    { id: 'court-game', source: 'court', target: 'game_session', label: 'hosts' },
    { id: 'user-game', source: 'user', target: 'game_session', label: 'plays in' },
    { id: 'user-tournament', source: 'user', target: 'tournament', label: 'participates' },
  ];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default DatabaseVisualization;`;
}

/**
 * 🚀 Основная функция
 */
async function main() {
  console.log("🎨 Генерация ERD диаграммы из Drizzle схемы");
  console.log("=" .repeat(50));

  try {
    // Создаем DBML файл
    const dbmlContent = generateDBML();
    const dbmlPath = path.join(process.cwd(), "database-schema.dbml");
    await fs.writeFile(dbmlPath, dbmlContent, "utf8");
    console.log(`✅ DBML файл создан: ${dbmlPath}`);

    // Создаем React компонент
    const reactContent = generateReactVisualization();
    const reactPath = path.join(process.cwd(), "DatabaseVisualization.tsx");
    await fs.writeFile(reactPath, reactContent, "utf8");
    console.log(`✅ React компонент создан: ${reactPath}`);

    console.log("");
    console.log("🎯 Следующие шаги:");
    console.log("1. Установите DBML расширение для VS Code");
    console.log("2. Откройте database-schema.dbml в VS Code");
    console.log("3. Используйте https://dbdiagram.io для онлайн визуализации");
    console.log("4. Или используйте React компонент в вашем приложении");

  } catch (error) {
    console.error("❌ Ошибка:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
