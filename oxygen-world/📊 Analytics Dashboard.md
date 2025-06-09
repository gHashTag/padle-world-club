---
title: "📊 Analytics Dashboard - Phangan Club Intelligence"
tags: [dashboard, analytics, metrics, insights, Phangan]
cssclasses: [analytics-dashboard]
---

# 📊 Analytics Dashboard - Phangan Padel Tennis Club

[[🏠 MAIN DASHBOARD|← Назад к главному дашборду]]

_Комплексная аналитика и бизнес-интеллект для островного клуба_

## 🎯 Executive Summary

```dataview
TABLE WITHOUT ID
  "💰 Месячный доход (THB)" as "📈 KPI",
  total_revenue as "📊 Current",
  "200,000" as "🎯 Target",
  "✅ On Track" as "✅ Status"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Analytics-Monthly-Report")
LIMIT 1
```

```dataview
TABLE WITHOUT ID
  "📅 Всего бронирований" as "📈 KPI",
  total_bookings as "📊 Current",
  "100" as "🎯 Target",
  "✅ Good" as "✅ Status"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Analytics-Monthly-Report")
LIMIT 1
```

```dataview
TABLE WITHOUT ID
  "👥 Активных клиентов" as "📈 KPI",
  total_clients as "📊 Current",
  "20" as "🎯 Target",
  "⚠️ Below Target" as "✅ Status"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Analytics-Monthly-Report")
LIMIT 1
```

```dataview
TABLE WITHOUT ID
  "🏓 Загрузка кортов (%)" as "📈 KPI",
  court_utilization + "%" as "📊 Current",
  "85%" as "🎯 Target",
  "⚠️ Below Target" as "✅ Status"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Analytics-Monthly-Report")
LIMIT 1
```

### 💡 Key Insights Today

- **🏆 Best Performance**: Суббота показала 100% загрузку кортов
- **💰 Revenue Leader**: Теннисный корт генерирует 70% дохода
- **👥 Player Growth**: +15% новых игроков за месяц
- **🎮 Popular Time**: 18:00-20:00 - пиковое время для всех видов спорта

## 📈 Revenue Analytics

### Monthly Revenue Trend

```mermaid
xychart-beta
    title "Месячная выручка (THB)"
    x-axis [Sep, Oct, Nov, Dec, Jan]
    y-axis "Revenue" 120000 --> 200000
    bar [152000, 165000, 148000, 175000, 185000]
```

### Revenue Breakdown by Category

```mermaid
pie title Структура доходов (январь 2024)
    "Аренда теннис" : 85000
    "Аренда падел" : 35000
    "Тренировки" : 37000
    "Товары" : 18000
    "События" : 10000
```

### Daily Revenue Pattern

| День недели | Средний доход | Пик часы    | Загрузка | Growth vs LM |
| ----------- | ------------- | ----------- | -------- | ------------ |
| Понедельник | ₿ 4,800       | 18:00-20:00 | 65%      | ↗️ +8%       |
| Вторник     | ₿ 5,200       | 17:00-19:00 | 75%      | ↗️ +12%      |
| Среда       | ₿ 4,900       | 19:00-21:00 | 70%      | ↗️ +5%       |
| Четверг     | ₿ 5,500       | 18:00-20:00 | 80%      | ↗️ +15%      |
| Пятница     | ₿ 6,800       | 17:00-21:00 | 95%      | ↗️ +25%      |
| Суббота     | ₿ 8,200       | 09:00-21:00 | 100%     | ↗️ +30%      |
| Воскресенье | ₿ 6,100       | 10:00-18:00 | 85%      | ↗️ +18%      |

## 👥 Customer Analytics

### Customer Segmentation

```mermaid
sankey-beta
    title Customer Journey & Segmentation

    New Players,VIP,15
    New Players,Regular,35
    New Players,Casual,50

    VIP,Tennis,8
    VIP,Padel,4
    VIP,Both,3

    Regular,Tennis,15
    Regular,Padel,8
    Regular,Both,2

    Casual,Tennis,12
    Casual,Padel,5
```

### Customer Lifetime Value

| Сегмент     | Клиентов | Avg Monthly Spend | LTV (12м) | Retention | Churn Risk |
| ----------- | -------- | ----------------- | --------- | --------- | ---------- |
| **VIP**     | 8        | ₿ 12,000          | ₿ 144,000 | 95%       | 🟢 Low     |
| **Regular** | 25       | ₿ 4,500           | ₿ 54,000  | 85%       | 🟡 Medium  |
| **Casual**  | 17       | ₿ 1,800           | ₿ 21,600  | 70%       | 🔴 High    |

### Player Activity Heatmap

```mermaid
gantt
    title Активность игроков по часам и дням
    dateFormat  X
    axisFormat %H

    section Понедельник
    Low Activity     :0, 6
    Medium Activity  :6, 12
    High Activity    :18, 22

    section Вторник
    Low Activity     :0, 6
    Medium Activity  :6, 17
    High Activity    :17, 22

    section Среда
    Low Activity     :0, 6
    Medium Activity  :6, 19
    High Activity    :19, 22

    section Четверг
    Low Activity     :0, 6
    Medium Activity  :6, 18
    High Activity    :18, 22

    section Пятница
    Low Activity     :0, 6
    Medium Activity  :6, 17
    Peak Activity    :17, 22

    section Суббота
    Medium Activity  :9, 21

    section Воскресенье
    Low Activity     :0, 10
    High Activity    :10, 18
```

## 🏓 Court Utilization Analytics

### Court Performance Comparison

| Метрика              | Tennis Court | Padel Court | Difference |
| -------------------- | ------------ | ----------- | ---------- |
| **Booking Rate**     | 85%          | 72%         | +13%       |
| **Revenue/Hour**     | ₿ 1,063      | ₿ 722       | +47%       |
| **Customer Rating**  | 4.8/5        | 4.6/5       | +0.2       |
| **Maintenance Cost** | ₿ 3,200/м    | ₿ 2,800/м   | +14%       |

### Hourly Utilization Analysis

```mermaid
xychart-beta
    title "Загрузка кортов по часам (%)"
    x-axis [06, 08, 10, 12, 14, 16, 18, 20, 22]
    y-axis "Utilization %" 0 --> 100
    line [20, 35, 55, 45, 60, 75, 95, 85, 40]
```

### Peak Hours Optimization

```mermaid
graph TB
    A[Peak Time 17-21] --> B[95% Utilization]
    A --> C[Wait List: 15+ people]
    A --> D[Price Premium: +25%]

    E[Off-Peak 06-12] --> F[35% Utilization]
    E --> G[Discount Opportunity: -20%]
    E --> H[Target: Senior players]

    style A fill:#FF9800
    style E fill:#4CAF50
    style B fill:#F44336,color:#FFFFFF
    style F fill:#2196F3,color:#FFFFFF
```

## 🎯 Marketing & Acquisition Analytics

### Customer Acquisition Channels

```mermaid
pie title Источники новых клиентов
    "Word of Mouth" : 40
    "Social Media" : 25
    "Hotel Partners" : 20
    "Direct Website" : 10
    "Local Advertising" : 5
```

### Marketing ROI Analysis

| Канал                  | Инвестиции (THB) | Новых клиентов | Cost per Acquisition | LTV/CAC Ratio |
| ---------------------- | ---------------- | -------------- | -------------------- | ------------- |
| **Instagram Ads**      | ₿ 8,000          | 12             | ₿ 667                | 32:1          |
| **Google Ads**         | ₿ 5,500          | 8              | ₿ 688                | 31:1          |
| **Hotel Partnerships** | ₿ 12,000         | 25             | ₿ 480                | 45:1          |
| **Referral Program**   | ₿ 3,200          | 18             | ₿ 178                | 121:1         |

### Social Media Performance

```mermaid
xychart-beta
    title "Social Media Engagement"
    x-axis [Instagram, Facebook, TikTok, YouTube]
    y-axis "Followers" 0 --> 3000
    bar [2800, 1500, 850, 420]
```

## 📊 Operational Metrics

### Staff Performance

| Сотрудник       | Роль         | Клиентов/день | Рейтинг | Эффективность |
| --------------- | ------------ | ------------- | ------- | ------------- |
| David Smith     | Tennis Coach | 8             | 4.9/5   | ✅ Excellent  |
| Maria Rodriguez | Padel Coach  | 6             | 4.8/5   | ✅ Excellent  |
| Anna Johnson    | Tennis Coach | 5             | 4.7/5   | ✅ Very Good  |
| Carlos Mendez   | Padel Coach  | 4             | 4.6/5   | ✅ Good       |

### Equipment Utilization

```mermaid
graph LR
    A[Tennis Rackets<br/>Usage: 85%] --> B[Replacement<br/>Every 6 months]
    C[Padel Rackets<br/>Usage: 75%] --> D[Replacement<br/>Every 8 months]
    E[Tennis Balls<br/>Usage: 90%] --> F[Weekly<br/>Replenishment]
    G[Padel Balls<br/>Usage: 80%] --> H[Bi-weekly<br/>Replenishment]

    style A fill:#4CAF50
    style C fill:#FF9800
    style E fill:#2196F3
    style G fill:#9C27B0
```

### Maintenance Schedule Efficiency

| Задача обслуживания | Частота          | Последнее | Следующее  | Статус       |
| ------------------- | ---------------- | --------- | ---------- | ------------ |
| Чистка кортов       | Ежедневно        | Сегодня   | Завтра     | ✅ Done      |
| Проверка сеток      | Еженедельно      | 3 дня     | 4 дня      | ✅ On track  |
| Обновление разметки | Месячно          | 15 дней   | 15 дней    | ⏳ Pending   |
| Замена LED ламп     | По необходимости | 2 месяца  | По сигналу | ✅ Monitored |

## 🌴 Island-Specific Analytics

### Weather Impact Analysis

```mermaid
xychart-beta
    title "Weather vs Booking Correlation"
    x-axis [Sunny, Cloudy, Light Rain, Heavy Rain]
    y-axis "Bookings" 0 --> 25
    bar [22, 18, 12, 3]
```

### Tourist Season Correlation

| Период          | Туристы/день | Bookings/день | Conversion | Revenue Impact |
| --------------- | ------------ | ------------- | ---------- | -------------- |
| **High Season** | 350          | 18            | 5.1%       | +45%           |
| **Mid Season**  | 180          | 12            | 6.7%       | Base           |
| **Low Season**  | 80           | 8             | 10.0%      | -35%           |

### Ferry Schedule Impact

```mermaid
gantt
    title Влияние расписания паромов на бронирования
    dateFormat  HH:mm
    axisFormat %H:%M

    section Arrival Ferries
    Morning Ferry    :08:00, 1h
    Afternoon Ferry  :14:00, 1h
    Evening Ferry    :19:00, 1h

    section Booking Spikes
    Post-Morning     :09:00, 2h
    Post-Afternoon   :15:00, 2h
    Post-Evening     :20:00, 1h
```

## 🤖 AI Analytics & Predictions

### AI Model Performance

| Model                  | Accuracy | Predictions/Day | Success Rate | Confidence |
| ---------------------- | -------- | --------------- | ------------ | ---------- |
| **Demand Prediction**  | 87.3%    | 24              | 85%          | High       |
| **Player Matching**    | 92.0%    | 35              | 90%          | Very High  |
| **Court Optimization** | 85.0%    | 12              | 82%          | High       |
| **Revenue Forecast**   | 89.5%    | 7               | 88%          | High       |

### AI Recommendations Impact

```mermaid
graph LR
    A[AI Suggestion] --> B[User Acceptance: 88%]
    B --> C[Revenue Increase: +15%]
    B --> D[Customer Satisfaction: +0.3]
    B --> E[Operational Efficiency: +22%]

    style A fill:#9C27B0,color:#FFFFFF
    style C fill:#4CAF50
    style D fill:#FF9800
    style E fill:#2196F3,color:#FFFFFF
```

### Predictive Analytics Dashboard

```json
{
  "next_week_forecast": {
    "total_revenue": "₿47,500",
    "court_utilization": "82%",
    "new_customers": 8,
    "weather_risk": "low",
    "confidence": "91.2%"
  },
  "optimization_opportunities": [
    "Increase padel morning rates by 10%",
    "Add Tuesday evening promotions",
    "Target off-peak senior discounts"
  ]
}
```

## 📱 Digital Analytics

### App Usage Statistics

| Метрика                | iOS   | Android | Web    | Total |
| ---------------------- | ----- | ------- | ------ | ----- |
| **Daily Active Users** | 35    | 28      | 45     | 108   |
| **Booking Rate**       | 85%   | 78%     | 65%    | 76%   |
| **Session Duration**   | 8 min | 7 min   | 12 min | 9 min |
| **Retention (7-day)**  | 82%   | 75%     | 68%    | 75%   |

### Feature Usage Analysis

```mermaid
pie title Популярность функций приложения
    "Court Booking" : 45
    "Schedule View" : 25
    "Payment" : 15
    "Chat/Messaging" : 10
    "Equipment Rental" : 5
```

## 🎯 Competitive Analysis

### Market Position

| Фактор               | Phangan Club | Competitor A | Competitor B | Advantage |
| -------------------- | ------------ | ------------ | ------------ | --------- |
| **Court Quality**    | 9.2/10       | 7.5/10       | 8.0/10       | +1.7      |
| **Location**         | 9.8/10       | 6.0/10       | 7.2/10       | +2.6      |
| **Technology**       | 9.5/10       | 5.5/10       | 6.8/10       | +2.7      |
| **Pricing**          | 7.5/10       | 8.5/10       | 7.8/10       | -1.0      |
| **Customer Service** | 9.1/10       | 7.2/10       | 7.8/10       | +1.3      |

### SWOT Analysis

```mermaid
quadrantChart
    title SWOT Analysis
    x-axis Low --> High
    y-axis Low --> High
    quadrant-1 Opportunities
    quadrant-2 Strengths
    quadrant-3 Threats
    quadrant-4 Weaknesses

    Unique Location: [0.9, 0.9]
    AI Technology: [0.85, 0.85]
    Premium Service: [0.8, 0.8]
    Limited Capacity: [0.3, 0.7]
    Weather Dependency: [0.4, 0.3]
    Tourist Market: [0.8, 0.7]
    Expansion Plans: [0.7, 0.75]
    Competition: [0.6, 0.2]
```

## 📈 Financial Analytics Deep Dive

### Profitability by Hour

```mermaid
xychart-beta
    title "Profit Margin by Time Slot"
    x-axis [06-09, 09-12, 12-15, 15-18, 18-21, 21-22]
    y-axis "Profit %" 0 --> 50
    line [25, 35, 30, 45, 48, 40]
```

### Cost Structure Analysis

| Категория затрат  | % от выручки | THB/месяц | Тренд   | Бенчмарк |
| ----------------- | ------------ | --------- | ------- | -------- |
| **Персонал**      | 15.1%        | ₿ 28,000  | ↘️ -2%  | 18%      |
| **Электричество** | 4.6%         | ₿ 8,500   | ↗️ +8%  | 6%       |
| **Maintenance**   | 3.4%         | ₿ 6,200   | ↘️ -5%  | 4%       |
| **Маркетинг**     | 1.7%         | ₿ 3,200   | ↗️ +15% | 3%       |

## 🔮 Future Analytics & Trends

### Growth Projections

```mermaid
xychart-beta
    title "Revenue Growth Forecast (6 months)"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Revenue (THB)" 150000 --> 250000
    line [185000, 195000, 210000, 180000, 165000, 200000]
```

### Expansion Opportunity Analysis

- **📈 Third Court**: ROI 24 months, +40% capacity
- **🏊 Pool Addition**: ROI 36 months, +25% premium
- **🍽️ Restaurant**: ROI 18 months, +30% retention
- **🏨 Accommodation**: ROI 48 months, +60% tourist revenue

---

_Analytics data refreshed every 15 minutes | Last update: {{date:YYYY-MM-DD HH:mm}}_  
_📊 Powered by Phangan Analytics Engine - Data-Driven Excellence on Paradise Island_
