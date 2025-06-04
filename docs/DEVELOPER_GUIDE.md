# 👨‍💻 Developer Guide - Padel World Club API

## Welcome to the Team! 🎉

This guide will help you get up to speed with the Padel World Club API codebase, development practices, and contribution guidelines.

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- **PostgreSQL** 15+ (or Neon account)
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - REST Client

### First-Time Setup

1. **Clone and Install**:
   ```bash
   git clone https://github.com/gHashTag/padle-world-club.git
   cd padle-world-club
   bun install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**:
   ```bash
   bun run db:generate
   bun run db:migrate
   bun run db:seed  # Optional: sample data
   ```

4. **Verify Installation**:
   ```bash
   bun run typecheck  # Should pass without errors
   bun run test       # Should run all tests
   bun run dev        # Start development server
   ```

## 🏗️ Project Structure

```
src/
├── api/                    # Express.js API layer
│   ├── docs/              # OpenAPI documentation
│   ├── handlers/          # Request handlers (business logic)
│   ├── middleware/        # Express middleware
│   ├── routes/            # Route definitions
│   ├── validators/        # Request/response validation
│   └── __tests__/         # API integration tests
├── db/                     # Database layer
│   ├── migrations/        # Database migrations
│   ├── repositories/      # Data access layer
│   ├── schemas/           # Database schemas (Drizzle)
│   ├── seeds/             # Sample data
│   └── __tests__/         # Database tests
├── shared/                 # Shared utilities
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   └── config/            # Configuration management
└── __tests__/              # End-to-end tests
```

## 🎯 Development Workflow

### 1. Feature Development

**Branch Naming Convention**:
```bash
feature/user-authentication
bugfix/booking-validation
hotfix/payment-processing
docs/api-documentation
```

**Development Process**:
1. Create feature branch from `main`
2. Write failing tests (TDD approach)
3. Implement feature
4. Ensure all tests pass
5. Update documentation
6. Create pull request

### 2. TDD Workflow

We follow Test-Driven Development:

```bash
# Use our TDD helper script
bun run tdd src/api/__tests__/users.test.ts

# Or manually:
# 1. Write failing test
# 2. Run: bun run test:watch
# 3. Implement code until test passes
# 4. Refactor and repeat
```

### 3. Code Quality Checks

Before committing, always run:
```bash
bun run typecheck     # TypeScript compilation
bun run lint          # ESLint checks
bun run format        # Prettier formatting
bun run test          # All tests
```

## 🧩 Architecture Patterns

### Functional Programming

We use functional programming principles throughout:

```typescript
// ✅ Good: Pure function
const calculateBookingTotal = (
  hourlyRate: number,
  durationMinutes: number,
  discountPercent: number = 0
): number => {
  const hours = durationMinutes / 60;
  const subtotal = hourlyRate * hours;
  return subtotal * (1 - discountPercent / 100);
};

// ✅ Good: Function composition
const processBooking = FunctionalCompose.pipe(
  validateBookingRequest,
  checkCourtAvailability,
  calculatePricing,
  createBookingRecord,
  processPayment,
  sendConfirmation
);
```

### Repository Pattern

Data access is handled through repositories:

```typescript
// ✅ Good: Repository interface
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implementation with Drizzle ORM
export class DrizzleUserRepository implements UserRepository {
  // ... implementation
}
```

### Handler Pattern

Request handlers are pure functions:

```typescript
// ✅ Good: Pure handler function
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await FunctionalCompose.pipe(
    validateCreateUserRequest,
    checkEmailUniqueness,
    hashPassword,
    saveUser,
    generateAuthToken,
    formatUserResponse
  )(req.body);

  ApiResponse.success(res, req, result, 'User created successfully', 201);
};
```

## 📝 Coding Standards

### TypeScript Guidelines

1. **Strict Type Safety**:
   ```typescript
   // ✅ Good: Explicit types
   interface CreateBookingRequest {
     courtId: string;
     startTime: Date;
     durationMinutes: number;
     notes?: string;
   }

   // ❌ Bad: Any types
   const processBooking = (data: any) => { ... }
   ```

2. **Use Enums for Constants**:
   ```typescript
   // ✅ Good: Type-safe enums
   export enum BookingStatus {
     PENDING = 'pending',
     CONFIRMED = 'confirmed',
     CANCELLED = 'cancelled',
     COMPLETED = 'completed'
   }
   ```

3. **Utility Types**:
   ```typescript
   // ✅ Good: Utility types for transformations
   type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
   type UpdateUserData = Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>;
   ```

### Error Handling

1. **Custom Error Classes**:
   ```typescript
   export class ValidationError extends Error {
     constructor(
       message: string,
       public field: string,
       public code: string = 'VALIDATION_ERROR'
     ) {
       super(message);
       this.name = 'ValidationError';
     }
   }
   ```

2. **Error Response Format**:
   ```typescript
   // Consistent error responses
   ApiResponse.error(res, req, 'Validation failed', 400, {
     field: 'email',
     code: 'INVALID_EMAIL'
   });
   ```

### Database Operations

1. **Use Transactions**:
   ```typescript
   // ✅ Good: Transactional operations
   await db.transaction(async (tx) => {
     const booking = await tx.insert(bookings).values(bookingData);
     await tx.insert(payments).values(paymentData);
     return booking;
   });
   ```

2. **Proper Error Handling**:
   ```typescript
   try {
     const user = await userRepository.findById(id);
     if (!user) {
       throw new NotFoundError('User not found');
     }
     return user;
   } catch (error) {
     logger.error('Failed to fetch user', { error, userId: id });
     throw error;
   }
   ```

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('User Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should authenticate valid user credentials', async () => {
      // Arrange
      const userData = { email: 'test@example.com', password: 'password123' };
      
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(userData);
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

### Test Categories

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test API endpoints with database
3. **E2E Tests**: Test complete user workflows

### Mocking Guidelines

```typescript
// ✅ Good: Mock external dependencies
vi.mock('../services/email-service', () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(true)
}));
```

## 📚 API Documentation

### OpenAPI Specifications

All endpoints must be documented in OpenAPI format:

```yaml
# Example endpoint documentation
/api/users/{id}:
  get:
    summary: Get user by ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      '200':
        description: User details
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
```

### Code Comments

```typescript
/**
 * Calculates the total cost for a court booking
 * 
 * @param hourlyRate - Court's hourly rate in cents
 * @param durationMinutes - Booking duration in minutes
 * @param discountPercent - Discount percentage (0-100)
 * @returns Total cost in cents
 * 
 * @example
 * calculateBookingTotal(5000, 90, 10) // Returns 6750 (67.50 with 10% discount)
 */
```

## 🔧 Debugging

### Development Tools

1. **VS Code Debugger**: Configuration in `.vscode/launch.json`
2. **Database GUI**: Use Drizzle Studio (`bun run db:studio`)
3. **API Testing**: Use REST Client or Postman
4. **Logs**: Check application logs for debugging

### Common Issues

1. **Database Connection**: Check `DATABASE_URL` in `.env`
2. **Type Errors**: Run `bun run typecheck` for detailed errors
3. **Test Failures**: Use `bun run test:watch` for continuous testing
4. **Migration Issues**: Check migration files and database state

## 🚀 Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
PORT=3000
```

### Build Process

```bash
bun run build     # TypeScript compilation
bun run start     # Start production server
```

## 🤝 Contributing

### Pull Request Process

1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Make Changes**: Follow coding standards
3. **Add Tests**: Ensure good test coverage
4. **Update Docs**: Update relevant documentation
5. **Quality Checks**: Run all quality checks
6. **Create PR**: Use PR template
7. **Code Review**: Address review feedback
8. **Merge**: Squash and merge when approved

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

## 📞 Getting Help

- **Documentation**: Check `/docs` directory
- **API Docs**: Visit `/api/docs` when server is running
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions
- **Team Chat**: [Your team communication channel]

---

Welcome to the team! Happy coding! 🚀
