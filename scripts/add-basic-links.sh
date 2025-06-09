#!/bin/bash

# Script to add basic links to all files that don't have them yet
# This ensures NO isolated nodes in the Obsidian graph

DATABASE_DIR="oxygen-world/Database"

echo "🔗 Adding basic links to all unconnected files..."

# Function to add links to user files
add_user_links() {
    local file="$1"
    local filename=$(basename "$file" .md)
    
    # Check if file already has links
    if grep -q "## 🔗 \*\*Связанные Данные\*\*" "$file"; then
        echo "✅ $filename already has links"
        return
    fi
    
    # Add basic links section
    cat >> "$file" << 'EOF'

## 🔗 **Связанные Данные**

### 👥 **Команда**
- [[User-Anna-Johnson|👤 Anna Johnson - VIP Тренер]]
- [[User-David-Smith|👤 David Smith - Топ игрок]]

### 📊 **Аналитика**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Все пользователи]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Профиль синхронизируется автоматически*
*🏝️ Phangan Padel Tennis Club Member*
EOF
    
    echo "✅ Added links to $filename"
}

# Function to add links to booking files
add_booking_links() {
    local file="$1"
    local filename=$(basename "$file" .md)
    
    # Check if file already has links
    if grep -q "## 🔗 \*\*Связанные Данные\*\*" "$file"; then
        echo "✅ $filename already has links"
        return
    fi
    
    # Add basic links section before the final line
    sed -i '' '/---$/i\
\
## 🔗 **Связанные Данные**\
\
### 👤 **Клиент**\
- [[User-Profile|👤 Профиль клиента]]\
\
### 🏓 **Корт**\
- [[Court-Tennis|🏓 Tennis Court]]\
- [[Court-Padel|🏓 Padel Court]]\
\
### 📊 **Аналитика**\
- [[Bookings-Data|📅 Все бронирования]]\
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]\
\
---\
' "$file"
    
    echo "✅ Added links to $filename"
}

# Function to add links to other files
add_generic_links() {
    local file="$1"
    local filename=$(basename "$file" .md)
    local file_type="$2"
    
    # Check if file already has links
    if grep -q "## 🔗 \*\*Связанные Данные\*\*" "$file" || grep -q "## 🔗 \*\*Quick Navigation\*\*" "$file"; then
        echo "✅ $filename already has links"
        return
    fi
    
    # Add basic links section
    cat >> "$file" << EOF

## 🔗 **Связанные Данные**

### 📊 **Дашборды**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]
- [[📅 Calendar Dashboard|📅 Календарь]]
- [[💰 Finance Dashboard|💰 Финансы]]

### 📁 **Данные**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Пользователи]]
- [[Bookings-Data|📅 Бронирования]]

---

*$file_type обновляется автоматически*
*🏝️ Phangan Padel Tennis Club*
EOF
    
    echo "✅ Added links to $filename"
}

# Process all user files
echo "👥 Processing user files..."
for file in "$DATABASE_DIR"/User-*.md; do
    if [[ -f "$file" ]] && [[ ! "$file" =~ "Data" ]]; then
        add_user_links "$file"
    fi
done

# Process all booking files
echo "📅 Processing booking files..."
for file in "$DATABASE_DIR"/Booking-Today-*.md; do
    if [[ -f "$file" ]]; then
        add_booking_links "$file"
    fi
done

# Process payment files
echo "💰 Processing payment files..."
for file in "$DATABASE_DIR"/Payment-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Платеж"
    fi
done

# Process task files
echo "📋 Processing task files..."
for file in "$DATABASE_DIR"/Task-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Задача"
    fi
done

# Process contact files
echo "📞 Processing contact files..."
for file in "$DATABASE_DIR"/Contact-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Контакт"
    fi
done

# Process inventory files
echo "📦 Processing inventory files..."
for file in "$DATABASE_DIR"/Inventory-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Инвентарь"
    fi
done

# Process subscription files
echo "📦 Processing subscription files..."
for file in "$DATABASE_DIR"/Subscription-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Подписка"
    fi
done

# Process class files
echo "🎓 Processing class files..."
for file in "$DATABASE_DIR"/Class-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Класс"
    fi
done

# Process court files
echo "🏓 Processing court files..."
for file in "$DATABASE_DIR"/Court-*.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Корт"
    fi
done

# Process data summary files
echo "📊 Processing data files..."
for file in "$DATABASE_DIR"/*-Data.md; do
    if [[ -f "$file" ]]; then
        add_generic_links "$file" "Данные"
    fi
done

echo "🎉 Finished processing all files!"
echo "📊 All files should now be connected in the Obsidian graph"
