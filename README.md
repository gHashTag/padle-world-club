# 🏓 Padel World Club API

**Modern REST API for Padel Venue Management Platform**

A comprehensive, production-ready API for managing padel venues, courts, bookings, and payments. Built with TypeScript, Express.js, and functional programming principles.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![API Documentation](https://img.shields.io/badge/API-Documented-brightgreen.svg)](/api/docs)

## 🌟 Key Features

### 🏗️ **Enterprise Architecture**
- **Functional Programming**: Clean, composable, and testable code architecture
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Modular Design**: Domain-driven structure with clear separation of concerns
- **Scalable Infrastructure**: Built for high-performance and horizontal scaling

### 🎾 **Padel Management**
- **Venue Management**: Complete venue lifecycle with geographic search
- **Court Management**: Real-time availability, specifications, and scheduling
- **Booking System**: Advanced booking with participants and confirmations
- **Payment Processing**: Secure payments with multiple gateways and refunds

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin, Manager, and Player roles
- **Data Validation**: Comprehensive input validation with Zod
- **Rate Limiting**: API protection against abuse

### 📊 **Data & Analytics**
- **PostgreSQL Database**: Robust relational database with migrations
- **Real-time Features**: Live court availability and booking updates
- **Geographic Search**: Location-based venue discovery
- **Statistics & Reporting**: Usage analytics and performance metrics

### 🧪 **Quality Assurance**
- **Comprehensive Testing**: Unit, Integration, and E2E tests (85%+ coverage)
- **API Documentation**: Complete OpenAPI 3.0 specification with Swagger UI
- **Type Checking**: Strict TypeScript compilation
- **Code Quality**: ESLint, Prettier, and automated quality checks

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 15+ (or use Neon serverless)
- **Git** for version control

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gHashTag/padle-world-club.git
   cd padle-world-club
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/padel_db"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"

   # Server
   PORT=3000
   NODE_ENV="development"

   # API Configuration
   API_VERSION="v1"
   API_PREFIX="/api"
   ```

4. **Database setup:**
   ```bash
   # Generate and run migrations
   bun run db:generate
   bun run db:migrate

   # Optional: Seed with sample data
   bun run db:seed
   ```

5. **Start development server:**
   ```bash
   bun run dev
   ```

6. **Access the API:**
   - **API Base URL**: http://localhost:3000/api
   - **API Documentation**: http://localhost:3000/api/docs
   - **Health Check**: http://localhost:3000/health

## 📚 API Overview

### Core Endpoints

The API provides comprehensive functionality across 5 main domains:

#### 🔐 **Authentication** (`/api/auth`)
```bash
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
POST /api/auth/refresh      # Token refresh
GET  /api/auth/me          # Current user info
```

#### 👥 **Users** (`/api/users`)
```bash
GET    /api/users           # List users (admin/manager)
POST   /api/users           # Create user (admin)
GET    /api/users/{id}      # Get user details
PUT    /api/users/{id}      # Update user
DELETE /api/users/{id}      # Delete user (admin)
```

#### 🏢 **Venues** (`/api/venues`)
```bash
GET    /api/venues                    # List venues
POST   /api/venues                    # Create venue
GET    /api/venues/{id}               # Get venue details
PUT    /api/venues/{id}               # Update venue
DELETE /api/venues/{id}               # Delete venue
GET    /api/venues/search/location    # Geographic search
PATCH  /api/venues/{id}/status        # Update status
```

#### 🎾 **Courts** (`/api/courts`)
```bash
GET    /api/courts                     # List courts
POST   /api/courts                     # Create court
GET    /api/courts/{id}                # Get court details
PUT    /api/courts/{id}                # Update court
DELETE /api/courts/{id}                # Delete court
GET    /api/courts/venue/{venueId}     # Courts by venue
GET    /api/courts/{id}/availability   # Check availability
GET    /api/courts/{id}/stats          # Court statistics
```

#### 📅 **Bookings** (`/api/bookings`)
```bash
GET    /api/bookings                           # List bookings
POST   /api/bookings                           # Create booking
GET    /api/bookings/{id}                      # Get booking details
PUT    /api/bookings/{id}                      # Update booking
DELETE /api/bookings/{id}                      # Cancel booking
POST   /api/bookings/{id}/confirm              # Confirm booking
GET    /api/bookings/{id}/participants         # Manage participants
```

#### 💳 **Payments** (`/api/payments`)
```bash
GET    /api/payments                    # List payments
POST   /api/payments                    # Create payment
GET    /api/payments/{id}               # Get payment details
PUT    /api/payments/{id}               # Update payment
POST   /api/payments/{id}/refund        # Process refund
GET    /api/payments/methods            # Available payment methods
```

### Authentication

The API uses **JWT Bearer Token** authentication:

```bash
# Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use token in subsequent requests
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-26T10:00:00Z",
  "path": "/api/endpoint",
  "method": "GET"
}
```

## 📁 Project Structure

```
padle-world-club/
├── .cursor/rules/              # AI agent rules and guidelines
├── src/
│   ├── api/                    # Express.js API layer
│   │   ├── docs/              # OpenAPI 3.0 documentation
│   │   │   ├── schemas/       # API schemas (User, Venue, Court, etc.)
│   │   │   ├── auth.yaml      # Authentication endpoints
│   │   │   ├── users.yaml     # User management endpoints
│   │   │   ├── venues.yaml    # Venue management endpoints
│   │   │   ├── courts.yaml    # Court management endpoints
│   │   │   ├── bookings.yaml  # Booking management endpoints
│   │   │   ├── payments.yaml  # Payment processing endpoints
│   │   │   └── openapi.yaml   # Main OpenAPI specification
│   │   ├── handlers/          # Request handlers (functional approach)
│   │   ├── middleware/        # Express middleware (auth, validation, etc.)
│   │   ├── routes/            # Route definitions
│   │   ├── validators/        # Request/response validation schemas
│   │   ├── __tests__/         # API integration tests
│   │   └── app.ts             # Express application setup
│   ├── db/                     # Database layer
│   │   ├── migrations/        # Database migration files
│   │   ├── repositories/      # Data access layer (Repository pattern)
│   │   ├── schemas/           # Database schemas (Drizzle ORM)
│   │   ├── seeds/             # Database seed data
│   │   ├── __tests__/         # Database tests
│   │   └── index.ts           # Database connection and setup
│   ├── shared/                 # Shared utilities and types
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── constants/         # Application constants
│   │   └── config/            # Configuration management
│   └── __tests__/              # End-to-end tests
├── scripts/                    # Build and development scripts
├── docs/                       # Additional documentation
├── .env.example               # Environment variables template
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vitest.config.ts           # Test configuration
```

## 🛠️ Development Commands

### Core Commands
```bash
# Development
bun run dev              # Start development server with hot reload
bun run build            # Build for production
bun run start            # Start production server
bun run preview          # Preview production build locally

# Code Quality
bun run typecheck        # TypeScript type checking
bun run lint             # ESLint code analysis
bun run format           # Prettier code formatting
bun run test             # Run all tests
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Generate test coverage report
```

### Database Commands
```bash
# Schema & Migrations
bun run db:generate      # Generate new migration from schema changes
bun run db:migrate       # Apply pending migrations
bun run db:rollback      # Rollback last migration
bun run db:reset         # Reset database (drop all tables)
bun run db:seed          # Seed database with sample data
bun run db:studio        # Open Drizzle Studio (database GUI)

# Development Helpers
bun run db:push          # Push schema changes directly (dev only)
bun run db:pull          # Pull schema from existing database
```

### Testing Commands
```bash
# Unit Tests
bun run test:unit        # Run unit tests only
bun run test:integration # Run integration tests only
bun run test:e2e         # Run end-to-end tests only

# Specific Test Suites
bun run test:db          # Database layer tests
bun run test:api         # API layer tests
bun run test:auth        # Authentication tests

# TDD Workflow
bun run tdd <test-file>  # TDD cycle for specific test file
```

## 💡 Usage Examples

### Authentication Flow

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe"
  }'

# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "password": "securePassword123"
  }'

# Use token for authenticated requests
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Venue Management

```bash
# Create a new venue (Manager/Admin only)
curl -X POST http://localhost:3000/api/venues \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Padel Center",
    "description": "Modern padel facility in the city center",
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "United States",
      "postalCode": "10001",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "contactInfo": {
      "phone": "+1234567890",
      "email": "info@downtownpadel.com"
    },
    "operatingHours": {
      "monday": {"open": "09:00", "close": "22:00"},
      "tuesday": {"open": "09:00", "close": "22:00"}
    }
  }'

# Search venues by location
curl -X GET "http://localhost:3000/api/venues/search/location?latitude=40.7128&longitude=-74.0060&radius=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Booking Flow

```bash
# Create a booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courtId": "123e4567-e89b-12d3-a456-426614174001",
    "startTime": "2024-01-27T14:00:00Z",
    "durationMinutes": 90,
    "bookingPurpose": "free_play",
    "notes": "Weekend game with friends"
  }'

# Check court availability
curl -X GET "http://localhost:3000/api/courts/123e4567-e89b-12d3-a456-426614174001/availability?startDate=2024-01-27T09:00:00Z&endDate=2024-01-27T18:00:00Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Confirm booking with payment
curl -X POST http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethodId": "pm_1234567890",
    "paymentAmount": 67.50,
    "currency": "USD"
  }'
```

## 🏗️ Architecture

### Database Schema

The application uses a robust PostgreSQL schema with the following main entities:

- **Users**: Authentication and user management
- **Venues**: Padel facility information and management
- **Courts**: Individual court specifications and availability
- **Bookings**: Reservation system with participants
- **Payments**: Secure payment processing and refunds

### API Architecture

Built with functional programming principles:

```typescript
// Example: Functional composition for request handling
import { FunctionalCompose } from './shared/utils/functional-compose';

const handleCreateBooking = FunctionalCompose.pipe(
  validateRequest,
  checkAuthentication,
  checkCourtAvailability,
  createBooking,
  processPayment,
  sendConfirmation,
  formatResponse
);
```

### Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Admin, Manager, Player roles
- **Input Validation**: Comprehensive Zod validation
- **Rate Limiting**: API protection
- **CORS Configuration**: Secure cross-origin requests

## 🧪 Testing

The project maintains high test coverage across all layers:

```bash
# Run all tests
bun run test

# Test coverage report
bun run test:coverage

# Specific test suites
bun run test:unit        # Unit tests (85%+ coverage)
bun run test:integration # Integration tests
bun run test:e2e         # End-to-end tests
```

### Test Structure

- **Unit Tests**: Individual function and component testing
- **Integration Tests**: Database and API integration
- **E2E Tests**: Complete user workflow testing

## 📚 Documentation

- **API Documentation**: Available at `/api/docs` (Swagger UI)
- **OpenAPI Specification**: Complete API specification
- **Database Schema**: Documented in code and migrations
- **Architecture Diagrams**: Available in `/docs` directory

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**:
   ```env
   NODE_ENV=production
   DATABASE_URL=your_production_db_url
   JWT_SECRET=your_production_secret
   ```

2. **Build and Start**:
   ```bash
   bun run build
   bun run start
   ```

3. **Database Migration**:
   ```bash
   bun run db:migrate
   ```

### Docker Support

```dockerfile
# Dockerfile included for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `bun run test`
5. Check code quality: `bun run lint && bun run typecheck`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/)
- Database powered by [Drizzle ORM](https://orm.drizzle.team/) and [PostgreSQL](https://www.postgresql.org/)
- API documentation with [Swagger UI](https://swagger.io/tools/swagger-ui/)
- Testing with [Vitest](https://vitest.dev/)

---

**Ready to build the future of padel management? 🏓**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/gHashTag/padle-world-club) or contact the development team.
