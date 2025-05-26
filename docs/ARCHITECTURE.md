# 🏗️ Padel World Club API - Architecture Documentation

## Overview

The Padel World Club API is built with a modern, scalable architecture following functional programming principles and clean architecture patterns. This document provides a comprehensive overview of the system architecture, components, and data flow.

## 🎯 Architecture Principles

- **Functional Programming**: Pure functions, immutability, and composition
- **Clean Architecture**: Clear separation of concerns and dependency inversion
- **Domain-Driven Design**: Business logic organized around domain entities
- **API-First**: OpenAPI specification drives development
- **Test-Driven Development**: Comprehensive testing at all layers

## 🏛️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Frontend]
        MOBILE[Mobile App]
        API_DOCS[API Documentation<br/>Swagger UI]
    end

    subgraph "API Gateway"
        NGINX[NGINX<br/>Load Balancer]
        CORS[CORS Middleware]
        RATE[Rate Limiting]
    end

    subgraph "Express.js Application"
        subgraph "Middleware Stack"
            AUTH[JWT Authentication]
            VALID[Request Validation<br/>Zod Schemas]
            LOG[Logging<br/>Morgan]
            ERROR[Error Handler]
        end

        subgraph "API Routes"
            AUTH_R[Authentication<br/>/api/auth]
            USERS_R[Users<br/>/api/users]
            VENUES_R[Venues<br/>/api/venues]
            COURTS_R[Courts<br/>/api/courts]
            BOOKINGS_R[Bookings<br/>/api/bookings]
            PAYMENTS_R[Payments<br/>/api/payments]
        end

        subgraph "Business Logic"
            AUTH_H[Auth Handlers]
            USERS_H[User Handlers]
            VENUES_H[Venue Handlers]
            COURTS_H[Court Handlers]
            BOOKINGS_H[Booking Handlers]
            PAYMENTS_H[Payment Handlers]
        end

        subgraph "Data Access Layer"
            USER_REPO[User Repository]
            VENUE_REPO[Venue Repository]
            COURT_REPO[Court Repository]
            BOOKING_REPO[Booking Repository]
            PAYMENT_REPO[Payment Repository]
        end
    end

    subgraph "Database Layer"
        PG[(PostgreSQL<br/>Primary Database)]
        REDIS[(Redis<br/>Session Store)]
    end

    subgraph "External Services"
        PAYMENT_GW[Payment Gateway<br/>Stripe/PayPal]
        EMAIL[Email Service<br/>SendGrid]
        SMS[SMS Service<br/>Twilio]
        MAPS[Maps API<br/>Google Maps]
    end

    subgraph "Infrastructure"
        DOCKER[Docker Containers]
        CI_CD[GitHub Actions<br/>CI/CD Pipeline]
        MONITOR[Monitoring<br/>Logs & Metrics]
    end

    %% Client connections
    WEB --> NGINX
    MOBILE --> NGINX
    API_DOCS --> NGINX

    %% Gateway to middleware
    NGINX --> CORS
    CORS --> RATE
    RATE --> AUTH

    %% Middleware flow
    AUTH --> VALID
    VALID --> LOG
    LOG --> ERROR

    %% Routes to handlers
    AUTH_R --> AUTH_H
    USERS_R --> USERS_H
    VENUES_R --> VENUES_H
    COURTS_R --> COURTS_H
    BOOKINGS_R --> BOOKINGS_H
    PAYMENTS_R --> PAYMENTS_H

    %% Handlers to repositories
    AUTH_H --> USER_REPO
    USERS_H --> USER_REPO
    VENUES_H --> VENUE_REPO
    COURTS_H --> COURT_REPO
    BOOKINGS_H --> BOOKING_REPO
    PAYMENTS_H --> PAYMENT_REPO

    %% Repositories to database
    USER_REPO --> PG
    VENUE_REPO --> PG
    COURT_REPO --> PG
    BOOKING_REPO --> PG
    PAYMENT_REPO --> PG

    %% Session management
    AUTH_H --> REDIS

    %% External service connections
    PAYMENTS_H --> PAYMENT_GW
    BOOKINGS_H --> EMAIL
    BOOKINGS_H --> SMS
    VENUES_H --> MAPS

    %% Infrastructure
    DOCKER -.-> NGINX
    CI_CD -.-> DOCKER
    MONITOR -.-> LOG

    %% Styling
    classDef clientLayer fill:#e1f5fe
    classDef apiLayer fill:#f3e5f5
    classDef dataLayer fill:#e8f5e8
    classDef externalLayer fill:#fff3e0
    classDef infraLayer fill:#fce4ec

    class WEB,MOBILE,API_DOCS clientLayer
    class AUTH,VALID,LOG,ERROR,AUTH_R,USERS_R,VENUES_R,COURTS_R,BOOKINGS_R,PAYMENTS_R apiLayer
    class PG,REDIS,USER_REPO,VENUE_REPO,COURT_REPO,BOOKING_REPO,PAYMENT_REPO dataLayer
    class PAYMENT_GW,EMAIL,SMS,MAPS externalLayer
    class DOCKER,CI_CD,MONITOR infraLayer
```

## 📋 Layer Descriptions

### 🖥️ Client Layer
- **Web Frontend**: React/Vue.js web application
- **Mobile App**: React Native or native mobile applications
- **API Documentation**: Interactive Swagger UI for developers

### 🌐 API Gateway
- **NGINX**: Load balancing and reverse proxy
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API protection against abuse

### ⚡ Express.js Application

#### Middleware Stack
- **JWT Authentication**: Token-based security
- **Request Validation**: Zod schema validation
- **Logging**: Request/response logging with Morgan
- **Error Handler**: Centralized error processing

#### API Routes
- **Authentication**: User registration, login, token management
- **Users**: User profile and management
- **Venues**: Padel facility management
- **Courts**: Court specifications and availability
- **Bookings**: Reservation system
- **Payments**: Payment processing and refunds

#### Business Logic
Functional handlers implementing business rules for each domain.

#### Data Access Layer
Repository pattern for database operations with clean interfaces.

### 🗄️ Database Layer
- **PostgreSQL**: Primary relational database
- **Redis**: Session storage and caching

### 🔌 External Services
- **Payment Gateway**: Stripe/PayPal integration
- **Email Service**: SendGrid for notifications
- **SMS Service**: Twilio for mobile notifications
- **Maps API**: Google Maps for location services

### 🏗️ Infrastructure
- **Docker**: Containerized deployment
- **CI/CD**: GitHub Actions automation
- **Monitoring**: Logging and metrics collection

## 🔄 Data Flow

### 1. Request Flow
```
Client → NGINX → CORS → Rate Limiting → JWT Auth → Validation → Route Handler → Business Logic → Repository → Database
```

### 2. Response Flow
```
Database → Repository → Business Logic → Response Formatter → Error Handler → Client
```

### 3. Authentication Flow
```
Login Request → Auth Handler → User Repository → Password Verification → JWT Generation → Redis Session → Response
```

## 🛡️ Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-based Access**: Admin, Manager, Player roles
- **Session Management**: Redis-based session storage
- **Password Security**: Bcrypt hashing

### Data Protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin access

## 📊 Database Schema

### Core Entities
- **Users**: Authentication and profile data
- **Venues**: Padel facility information
- **Courts**: Individual court specifications
- **Bookings**: Reservation and scheduling
- **Payments**: Financial transactions

### Relationships
- Users can manage multiple Venues (Manager role)
- Venues contain multiple Courts
- Courts have multiple Bookings
- Bookings are associated with Payments
- Users can participate in multiple Bookings

## 🚀 Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Redis session clustering
- Load balancer configuration

### Performance Optimization
- Database indexing strategy
- Query optimization
- Caching layers
- Async processing for notifications

### Monitoring & Observability
- Request/response logging
- Performance metrics
- Error tracking
- Health checks

## 🧪 Testing Strategy

### Test Pyramid
- **Unit Tests**: Individual function testing
- **Integration Tests**: Database and API integration
- **E2E Tests**: Complete user workflow testing

### Test Coverage
- 85%+ code coverage requirement
- Critical path testing
- Error scenario testing
- Performance testing

## 📈 Future Enhancements

### Planned Features
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Mobile push notifications
- Multi-language support
- Advanced booking algorithms

### Technical Improvements
- Microservices migration
- Event-driven architecture
- GraphQL API layer
- Advanced caching strategies

---

This architecture provides a solid foundation for a scalable, maintainable, and secure padel management platform.
