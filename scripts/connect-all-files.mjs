#!/usr/bin/env node

/**
 * Comprehensive script to connect ALL files in the Database
 * This will ensure NO isolated nodes in the Obsidian graph
 */

import fs from 'fs';
import path from 'path';

class ComprehensiveLinker {
  constructor() {
    this.databasePath = 'oxygen-world/Database';
    this.processedFiles = new Set();
    
    // Define all file relationships
    this.relationships = {
      // Users and their related files
      users: {
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
        'User-Maria-Rodriguez': {
          bookings: ['Booking-Today-002'],
          payments: ['Payment-002'],
          classes: ['Class-Padel-Women']
        }
      },
      
      // Bookings and their relationships
      bookings: {
        'Booking-Today-001': { user: 'User-David-Smith', payment: 'Payment-001', court: 'Court-Tennis' },
        'Booking-Today-002': { user: 'User-Maria-Rodriguez', payment: 'Payment-002', court: 'Court-Padel' },
        'Booking-Today-003': { user: 'User-Sarah-Brown', payment: 'Payment-003', court: 'Court-Padel' },
        'Booking-Today-004': { user: 'User-David-Smith', payment: 'Payment-004', court: 'Court-Tennis' },
        'Booking-Today-005': { user: 'User-Anna-Johnson', payment: 'Payment-005', court: 'Court-Padel' },
        'Booking-Today-006': { user: 'User-Sarah-Brown', court: 'Court-Padel' },
        'Booking-Today-007': { court: 'Court-Tennis' },
        'Booking-Today-008': { court: 'Court-Padel' }
      },
      
      // Payments and their relationships
      payments: {
        'Payment-001': { user: 'User-David-Smith', booking: 'Booking-Today-001' },
        'Payment-002': { user: 'User-Maria-Rodriguez', booking: 'Booking-Today-002' },
        'Payment-003': { user: 'User-Sarah-Brown', booking: 'Booking-Today-003' },
        'Payment-004': { user: 'User-David-Smith', booking: 'Booking-Today-004' },
        'Payment-005': { user: 'User-Anna-Johnson', booking: 'Booking-Today-005' }
      }
    };
  }

  async connectAllFiles() {
    console.log('🔗 Starting comprehensive file linking...');
    
    // Get all files in Database directory
    const files = fs.readdirSync(this.databasePath).filter(f => f.endsWith('.md'));
    console.log(`📁 Found ${files.length} files to process`);
    
    // Process each file type
    await this.processUserFiles(files);
    await this.processBookingFiles(files);
    await this.processPaymentFiles(files);
    await this.processSubscriptionFiles(files);
    await this.processClassFiles(files);
    await this.processCourtFiles(files);
    await this.processTaskFiles(files);
    await this.processContactFiles(files);
    await this.processInventoryFiles(files);
    await this.processDataSummaryFiles(files);
    
    console.log(`✅ Successfully processed ${this.processedFiles.size} files`);
    console.log('🎉 All files are now connected!');
  }

  async processUserFiles(files) {
    const userFiles = files.filter(f => f.startsWith('User-') && !f.includes('Data'));
    console.log(`👥 Processing ${userFiles.length} user files...`);
    
    for (const file of userFiles) {
      await this.addLinksToUser(file);
    }
  }

  async addLinksToUser(filename) {
    const filePath = path.join(this.databasePath, filename);
    const fileKey = filename.replace('.md', '');
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    // Get relationships for this user
    const userRel = this.relationships.users[fileKey] || {};
    
    const linksSection = `
## 🔗 **Связанные Данные**

### 📅 **Мои Бронирования**
${userRel.bookings ? userRel.bookings.map(b => `- [[${b}|📅 ${b}]]`).join('\n') : '- _Нет активных бронирований_'}

### 💰 **Мои Платежи**
${userRel.payments ? userRel.payments.map(p => `- [[${p}|💰 ${p}]]`).join('\n') : '- _Нет платежей_'}

### 📦 **Моя Подписка**
${userRel.subscription ? `- [[${userRel.subscription}|📦 ${userRel.subscription}]]` : '- _Нет активной подписки_'}

### 🎓 **Мои Классы**
${userRel.classes ? userRel.classes.map(c => `- [[${c}|🎓 ${c}]]`).join('\n') : '- _Не участвую в классах_'}

### 📊 **Аналитика**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Все пользователи]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---`;

    // Insert before the final line
    content = content.replace(/---\s*\*Профиль.*$/, linksSection + '\n\n*Профиль обновляется автоматически после каждой игры*\n*🏝️ Phangan Padel Tennis Club Member*');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
    this.processedFiles.add(filename);
  }

  async processBookingFiles(files) {
    const bookingFiles = files.filter(f => f.startsWith('Booking-Today-'));
    console.log(`📅 Processing ${bookingFiles.length} booking files...`);
    
    for (const file of bookingFiles) {
      await this.addLinksToBooking(file);
    }
  }

  async addLinksToBooking(filename) {
    const filePath = path.join(this.databasePath, filename);
    const fileKey = filename.replace('.md', '');
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    // Get relationships for this booking
    const bookingRel = this.relationships.bookings[fileKey] || {};
    
    const linksSection = `
## 🔗 **Связанные Данные**

### 👤 **Клиент**
${bookingRel.user ? `- [[${bookingRel.user}|👤 ${bookingRel.user.replace('User-', '').replace('-', ' ')}]]` : '- _Клиент не указан_'}

### 💰 **Платеж**
${bookingRel.payment ? `- [[${bookingRel.payment}|💰 ${bookingRel.payment}]]` : '- _Платеж не найден_'}

### 🏓 **Корт**
${bookingRel.court ? `- [[${bookingRel.court}|🏓 ${bookingRel.court.replace('Court-', '')} Court]]` : '- _Корт не указан_'}

### 📊 **Аналитика**
- [[Bookings-Data|📅 Все бронирования]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---`;

    // Insert before the final line
    content = content.replace(/---\s*\*Автоматически.*$/, linksSection + '\n\n*Автоматически синхронизировано с системой бронирований*');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
    this.processedFiles.add(filename);
  }

  async processPaymentFiles(files) {
    const paymentFiles = files.filter(f => f.startsWith('Payment-'));
    console.log(`💰 Processing ${paymentFiles.length} payment files...`);
    
    for (const file of paymentFiles) {
      await this.addLinksToPayment(file);
    }
  }

  async addLinksToPayment(filename) {
    const filePath = path.join(this.databasePath, filename);
    const fileKey = filename.replace('.md', '');
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    // Get relationships for this payment
    const paymentRel = this.relationships.payments[fileKey] || {};
    
    const linksSection = `
## 🔗 **Связанные Данные**

### 👤 **Клиент**
${paymentRel.user ? `- [[${paymentRel.user}|👤 ${paymentRel.user.replace('User-', '').replace('-', ' ')}]]` : '- _Клиент не указан_'}

### 📅 **Бронирование**
${paymentRel.booking ? `- [[${paymentRel.booking}|📅 ${paymentRel.booking}]]` : '- _Бронирование не найдено_'}

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
    this.processedFiles.add(filename);
  }

  async processSubscriptionFiles(files) {
    const subscriptionFiles = files.filter(f => f.startsWith('Subscription-'));
    console.log(`📦 Processing ${subscriptionFiles.length} subscription files...`);
    
    for (const file of subscriptionFiles) {
      await this.addLinksToSubscription(file);
    }
  }

  async addLinksToSubscription(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

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
    this.processedFiles.add(filename);
  }

  async processClassFiles(files) {
    const classFiles = files.filter(f => f.startsWith('Class-'));
    console.log(`🎓 Processing ${classFiles.length} class files...`);
    
    for (const file of classFiles) {
      await this.addLinksToClass(file);
    }
  }

  async addLinksToClass(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    const linksSection = `
## 🔗 **Связанные Данные**

### 👨‍🏫 **Инструктор**
- [[User-Anna-Johnson|👨‍🏫 Anna Johnson - Тренер]]

### 👥 **Участники**
- [[User-David-Smith|👤 David Smith]]
- [[User-Sarah-Brown|👤 Sarah Brown]]

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
    this.processedFiles.add(filename);
  }

  async processCourtFiles(files) {
    const courtFiles = files.filter(f => f.startsWith('Court-'));
    console.log(`🏓 Processing ${courtFiles.length} court files...`);
    
    for (const file of courtFiles) {
      await this.addLinksToCourt(file);
    }
  }

  async addLinksToCourt(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    const courtType = filename.includes('Tennis') ? 'Tennis' : 'Padel';
    const bookings = courtType === 'Tennis' 
      ? ['Booking-Today-001', 'Booking-Today-004', 'Booking-Today-007']
      : ['Booking-Today-002', 'Booking-Today-003', 'Booking-Today-005', 'Booking-Today-006', 'Booking-Today-008'];

    const linksSection = `
## 🔗 **Связанные Данные**

### 📅 **Бронирования**
${bookings.map(b => `- [[${b}|📅 ${b}]]`).join('\n')}

### 👥 **Клиенты**
- [[User-David-Smith|👤 David Smith]]
- [[User-Anna-Johnson|👤 Anna Johnson]]
- [[User-Sarah-Brown|👤 Sarah Brown]]

### 📊 **Аналитика**
- [[Courts-Data|🏓 Все корты]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Информация о корте обновляется в реальном времени*
*🏝️ Phangan Padel Tennis Club Courts*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
    this.processedFiles.add(filename);
  }

  async processTaskFiles(files) {
    const taskFiles = files.filter(f => f.startsWith('Task-'));
    console.log(`📋 Processing ${taskFiles.length} task files...`);
    
    for (const file of taskFiles) {
      await this.addLinksToTask(file);
    }
  }

  async addLinksToTask(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    const linksSection = `
## 🔗 **Связанные Данные**

### 👤 **Ответственный**
- [[User-Anna-Johnson|👤 Anna Johnson - Менеджер]]

### 📋 **Проект**
- [[Tasks-Data|📋 Все задачи]]

### 📊 **Аналитика**
- [[📋 Tasks Dashboard|📋 Дашборд задач]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Задача обновляется автоматически*
*🏝️ Phangan Padel Tennis Club Tasks*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
    this.processedFiles.add(filename);
  }

  async processContactFiles(files) {
    const contactFiles = files.filter(f => f.startsWith('Contact-'));
    console.log(`📞 Processing ${contactFiles.length} contact files...`);
    
    for (const file of contactFiles) {
      await this.addLinksToContact(file);
    }
  }

  async addLinksToContact(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    const linksSection = `
## 🔗 **Связанные Данные**

### 📞 **Контакты**
- [[📞 All Contacts Dashboard|📞 Все контакты]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Контакт обновляется автоматически*
*🏝️ Phangan Padel Tennis Club Contacts*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
    this.processedFiles.add(filename);
  }

  async processInventoryFiles(files) {
    const inventoryFiles = files.filter(f => f.startsWith('Inventory-'));
    console.log(`📦 Processing ${inventoryFiles.length} inventory files...`);
    
    for (const file of inventoryFiles) {
      await this.addLinksToInventory(file);
    }
  }

  async addLinksToInventory(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Связанные Данные**')) {
      console.log(`✅ ${filename} already has links`);
      this.processedFiles.add(filename);
      return;
    }

    const linksSection = `
## 🔗 **Связанные Данные**

### 📦 **Инвентарь**
- [[📦 Inventory Dashboard|📦 Дашборд инвентаря]]
- [[Products-Data|📦 Все товары]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Инвентарь обновляется автоматически*
*🏝️ Phangan Padel Tennis Club Inventory*`;

    content += '\n' + linksSection;
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added links to ${filename}`);
    this.processedFiles.add(filename);
  }

  async processDataSummaryFiles(files) {
    const dataFiles = files.filter(f => f.includes('-Data.md') || f.includes('Data -'));
    console.log(`📊 Processing ${dataFiles.length} data summary files...`);
    
    for (const file of dataFiles) {
      await this.addLinksToDataFile(file);
    }
  }

  async addLinksToDataFile(filename) {
    const filePath = path.join(this.databasePath, filename);
    
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has links
    if (content.includes('## 🔗 **Quick Navigation**')) {
      console.log(`✅ ${filename} already has navigation`);
      this.processedFiles.add(filename);
      return;
    }

    const navigationSection = `
## 🔗 **Quick Navigation**

### 📊 **Dashboards**
- [[🏠 MAIN DASHBOARD|🏠 Main Dashboard]]
- [[📅 Calendar Dashboard|📅 Calendar]]
- [[💰 Finance Dashboard|💰 Finance]]
- [[📊 Analytics Dashboard|📊 Analytics]]

### 📁 **Related Data**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Users]]
- [[Bookings-Data|📅 Bookings]]
- [[Payments-Data|💰 Payments]]

---`;

    // Insert before the final line
    content = content.replace(/---\s*_.*Phangan.*_\s*$/, navigationSection + '\n_Data Summary | 🏝️ Phangan Padel Tennis Club_');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Added navigation to ${filename}`);
    this.processedFiles.add(filename);
  }
}

// Run the comprehensive linker
const linker = new ComprehensiveLinker();
linker.connectAllFiles().catch(console.error);
