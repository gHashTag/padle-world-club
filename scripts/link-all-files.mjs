#!/usr/bin/env node

/**
 * Script to automatically add cross-reference links to all database files
 * This will create a connected graph structure in Obsidian
 */

import fs from 'fs';
import path from 'path';

class FileLinkManager {
  constructor() {
    this.databasePath = 'oxygen-world/Database';
    this.linkMappings = {
      // User -> Related files
      'User-David-Smith': {
        bookings: ['Booking-Today-001', 'Booking-Today-004'],
        payments: ['Payment-001', 'Payment-004'],
        subscription: 'Subscription-Tennis-David',
        classes: ['Class-Tennis-Beginners']
      },
      'User-Anna-Johnson': {
        bookings: ['Booking-Today-002', 'Booking-Today-005'],
        payments: ['Payment-002', 'Payment-005'],
        subscription: 'Subscription-VIP-Anna',
        classes: ['Class-Tennis-Beginners']
      },
      'User-Sarah-Brown': {
        bookings: ['Booking-Today-003', 'Booking-Today-006'],
        payments: ['Payment-003'],
        subscription: 'Subscription-Padel-Sarah',
        classes: ['Class-Padel-Women']
      },
      
      // Booking -> Related files
      'Booking-Today-001': {
        user: 'User-David-Smith',
        payment: 'Payment-001',
        court: 'Court-Tennis'
      },
      'Booking-Today-002': {
        user: 'User-Anna-Johnson',
        payment: 'Payment-002',
        court: 'Court-Padel'
      },
      'Booking-Today-003': {
        user: 'User-Sarah-Brown',
        payment: 'Payment-003',
        court: 'Court-Padel'
      },
      
      // Payment -> Related files
      'Payment-001': {
        user: 'User-David-Smith',
        booking: 'Booking-Today-001'
      },
      'Payment-002': {
        user: 'User-Anna-Johnson',
        booking: 'Booking-Today-002'
      },
      'Payment-003': {
        user: 'User-Sarah-Brown',
        booking: 'Booking-Today-003'
      }
    };
  }

  async linkAllFiles() {
    console.log('🔗 Starting automatic file linking...');
    
    // Link remaining booking files
    await this.linkRemainingBookings();
    
    // Link remaining payment files
    await this.linkRemainingPayments();
    
    // Link subscription files
    await this.linkSubscriptions();
    
    // Link class files
    await this.linkClasses();
    
    // Link court files
    await this.linkCourts();
    
    // Link dashboard files
    await this.linkDashboards();
    
    console.log('✅ All files linked successfully!');
  }

  async linkRemainingBookings() {
    const bookingFiles = [
      'Booking-Today-002', 'Booking-Today-003', 'Booking-Today-004',
      'Booking-Today-005', 'Booking-Today-006', 'Booking-Today-007',
      'Booking-Today-008'
    ];

    for (const file of bookingFiles) {
      await this.addLinksToBooking(file);
    }
  }

  async addLinksToBooking(filename) {
    const filePath = path.join(this.databasePath, `${filename}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if links already exist
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      return;
    }

    // Add links section before the final separator
    const linksSection = `
## 🔗 **Связанные Данные**

### 👤 **Клиент**
- [[User-Profile|👤 Профиль клиента]]

### 💰 **Платеж**
- [[Payment-Related|💰 Связанный платеж]]

### 🏓 **Корт**
- [[Court-Info|🏓 Информация о корте]]

### 📊 **Аналитика**
- [[Bookings-Data|📅 Все бронирования]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---`;

    // Insert before the final line
    content = content.replace(/---\s*\*Автоматически.*$/, linksSection + '\n\n*Автоматически синхронизировано с системой бронирований*');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
  }

  async linkRemainingPayments() {
    const paymentFiles = [
      'Payment-002', 'Payment-003', 'Payment-004', 'Payment-005'
    ];

    for (const file of paymentFiles) {
      await this.addLinksToPayment(file);
    }
  }

  async addLinksToPayment(filename) {
    const filePath = path.join(this.databasePath, `${filename}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if links already exist
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      return;
    }

    // Add links section
    const linksSection = `
## 🔗 **Связанные Данные**

### 👤 **Клиент**
- [[User-Profile|👤 Профиль клиента]]

### 📅 **Бронирование**
- [[Booking-Related|📅 Связанное бронирование]]

### 💰 **Финансы**
- [[Payments-Data|💰 Все платежи]]
- [[💰 Finance Dashboard|💰 Финансовый дашборд]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---`;

    // Insert before the final line
    content = content.replace(/---\s*\*Автоматически.*$/, linksSection + '\n\n*Автоматически синхронизировано с платежной системой*');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
  }

  async linkSubscriptions() {
    const subscriptionFiles = [
      'Subscription-Tennis-David', 'Subscription-VIP-Anna', 'Subscription-Padel-Sarah'
    ];

    for (const file of subscriptionFiles) {
      await this.addLinksToSubscription(file);
    }
  }

  async addLinksToSubscription(filename) {
    const filePath = path.join(this.databasePath, `${filename}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if links already exist
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      return;
    }

    // Add links section at the end
    const linksSection = `
## 🔗 **Связанные Данные**

### 👤 **Подписчик**
- [[User-Profile|👤 Профиль подписчика]]

### 📅 **Бронирования**
- [[User-Bookings|📅 Бронирования подписчика]]

### 💰 **Платежи**
- [[Subscription-Payments|💰 Платежи по подписке]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Подписка обновляется автоматически*
*🏝️ Phangan Padel Tennis Club Subscription*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
  }

  async linkClasses() {
    const classFiles = ['Class-Tennis-Beginners', 'Class-Padel-Women'];

    for (const file of classFiles) {
      await this.addLinksToClass(file);
    }
  }

  async addLinksToClass(filename) {
    const filePath = path.join(this.databasePath, `${filename}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if links already exist
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      return;
    }

    // Add links section at the end
    const linksSection = `
## 🔗 **Связанные Данные**

### 👨‍🏫 **Инструктор**
- [[User-Instructor|👨‍🏫 Профиль инструктора]]

### 👥 **Участники**
- [[Class-Participants|👥 Список участников]]

### 📅 **Расписание**
- [[Classes-Data|📅 Все классы]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Информация о классе обновляется автоматически*
*🏝️ Phangan Padel Tennis Club Classes*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
  }

  async linkCourts() {
    const courtFiles = ['Court-Tennis', 'Court-Padel'];

    for (const file of courtFiles) {
      await this.addLinksToCourt(file);
    }
  }

  async addLinksToCourt(filename) {
    const filePath = path.join(this.databasePath, `${filename}.md`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if links already exist
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      return;
    }

    // Add links section at the end
    const linksSection = `
## 🔗 **Связанные Данные**

### 📅 **Бронирования**
- [[Court-Bookings|📅 Бронирования корта]]

### 👥 **Клиенты**
- [[Court-Customers|👥 Клиенты корта]]

### 📊 **Аналитика**
- [[Courts-Data|🏓 Все корты]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Информация о корте обновляется в реальном времени*
*🏝️ Phangan Padel Tennis Club Courts*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
  }

  async linkDashboards() {
    console.log('🔗 Linking dashboard files...');
    
    // Add navigation links to all dashboard files
    const dashboardFiles = [
      '📅 Calendar Dashboard.md',
      '📊 Analytics Dashboard.md',
      '💰 Finance Dashboard.md',
      '📋 Tasks Dashboard.md',
      '🎓 Classes Dashboard.md',
      '📦 Inventory Dashboard.md',
      '📞 All Contacts Dashboard.md',
      '📋 Subscriptions Dashboard.md',
      '⚙️ Settings Dashboard.md'
    ];

    for (const file of dashboardFiles) {
      await this.addNavigationToDashboard(file);
    }
  }

  async addNavigationToDashboard(filename) {
    const filePath = path.join('oxygen-world', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Dashboard not found: ${filename}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if navigation already exists
    if (content.includes('## 🔗 **Quick Navigation**')) {
      console.log(`✅ ${filename} already has navigation`);
      return;
    }

    // Add navigation section at the end
    const navigationSection = `
## 🔗 **Quick Navigation**

### 📊 **Dashboards**
- [[🏠 MAIN DASHBOARD|🏠 Main Dashboard]]
- [[📅 Calendar Dashboard|📅 Calendar]]
- [[💰 Finance Dashboard|💰 Finance]]
- [[📊 Analytics Dashboard|📊 Analytics]]
- [[📋 Tasks Dashboard|📋 Tasks]]

### 📁 **Data**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Users]]
- [[Bookings-Data|📅 Bookings]]
- [[Payments-Data|💰 Payments]]

### 🔧 **System**
- [[📊 DATABASE MODELS & RELATIONSHIPS|🗄️ Database Schema]]
- [[🔧 DATA RELATIONSHIP FIXES|🔧 Data Fixes]]

---`;

    // Insert before the final line
    content = content.replace(/---\s*_.*Phangan.*_\s*$/, navigationSection + '\n_Dashboard System | 🏝️ Phangan Padel Tennis Club_');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added navigation to ${filename}`);
  }
}

// Run the script
const linkManager = new FileLinkManager();
linkManager.linkAllFiles().catch(console.error);
