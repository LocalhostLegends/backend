# Backend API

NestJS backend for application with PostgreSQL, TypeORM, and Docker. This project is a robust, enterprise-ready API designed for scalability and maintainability.

## 🛠 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (v11+)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **Authentication:** [Passport.js](https://www.passportjs.org/) & JWT
- **Validation:** [class-validator](https://github.com/typestack/class-validator) & [Zod](https://zod.dev/)
- **Documentation:** [Swagger/OpenAPI](https://swagger.io/)
- **Infrastructure:** [Docker](https://www.docker.com/) & Docker Compose
- **Storage:** [MinIO](https://min.io/) (S3-compatible)
- **Email:** [Nodemailer](https://nodemailer.com/) / [Resend](https://resend.com/)

## ✨ Key Features

- 🔐 **Advanced Auth:** JWT access & refresh tokens, cookie support.
- 🛡️ **RBAC & Permissions:** Fine-grained resource-based access control.
- 🏢 **Multi-tenancy:** Company-based data isolation.
- 📝 **Audit Logging:** Systematic tracking of important system events.
- 📁 **File Storage:** Secure file uploads with S3-compatible storage.
- 📧 **Email System:** Template-based emails for invites and notifications.
- 🚦 **Rate Limiting:** Protection against brute-force and DDoS.
- 🔍 **Global Validation:** Unified request validation and error formatting.
- 📄 **Pagination:** Standardized pagination and filtering for all lists.

## 🚀 Quick Start

1. **Clone and install**

   ```bash
   git clone https://github.com/LocalhostLegends/backend
   npm install
   ```

2. **Environment setup**

   ```bash
   cp .env.development.example .env
   ```

3. **Start Infrastructure (Docker)**

   ```bash
   docker-compose up -d
   ```

4. **Run Database Migrations**

   ```bash
   npm run migration:run
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

## 📖 Documentation

- **Project Documentation:** [View Documentation](https://localhostlegends.github.io/documentation/)
- **Swagger UI (Local):** `http://localhost:3175/api/docs`
- **Redoc (Local):** `http://localhost:3175/api/docs-json`

## 📁 Project Structure

```
src/
├── main.ts                             # Application entry point
├── app.module.ts                       # Root module
│
├── common/                             # Shared resources
│   ├── constants/                      # Global constants
│   ├── decorators/                     # Custom decorators
│   ├── enums/                          # Global enums
│   ├── exceptions/                     # Custom exception handling
│   ├── filters/                        # Global filters (exception filter)
│   ├── interceptors/                   # Global interceptors (response)
│   ├── middleware/                     # Global middleware (context, logger)
│   ├── swagger/                        # Swagger documentation helpers
│   └── utils/                          # Utility functions
│
├── config/                             # Configuration schemas & files
├── database/                           # Entities, migrations, and seeds
└── modules/                            # Feature modules (Auth, Users, Org, etc.)
```

## 📜 Available Scripts

- `npm run dev` - Start in development mode with watch
- `npm run build` - Build the application for production
- `npm run start:prod` - Run the compiled production build
- `npm run lint` - Check code style with ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## 🗄 Database Management

- `npm run migration:generate -- Name` - Generate a new migration
- `npm run migration:run` - Apply pending migrations
- `npm run migration:revert` - Rollback last migration
- `npm run db:reset` - Drop schema and re-run all migrations (DANGER!)

## 🔒 Security

- [Helmet](https://helmetjs.github.io/) for security headers.
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) configured for specific origins.
- [Throttler](https://docs.nestjs.com/security/rate-limiting) for rate limiting.
- Secure password hashing with `bcryptjs`.

## 📄 License

This project is [UNLICENSED](LICENSE).
