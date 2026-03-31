# Backend API

NestJS backend for application with PostgreSQL, TypeORM, and Docker.

## 🚀 Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/LocalhostLegends/backend
   npm install

2. **Environment setup**
   ```bash
   cp .env.example .env

3. **Start Docker containers (PostgreSQL + pgAdmin)**
   ```bash
   docker-compose up -d

4. **Run migrations**
   ```bash
   npm run migration:run

5. **Start the application**
   ```bash
   npm run dev

- The API will be available at: http://localhost:3175/api
- Swagger documentation: http://localhost:3175/api/docs
- pgAdmin: http://localhost:5050 (admin@admin.com / admin)
- Storage: http://localhost:9000 (minioadmin / minioadmin)


## 📁 Project Structure
```
src/
├── main.ts
├── app.module.ts
│
├── config/                             # Configuration
│   └── configuration.ts                # Environment variables config
│
├── common/                             # Shared resources
│   ├── interceptors/
│   │   └── response.interceptor.ts     # Unified response format
│   └── filters/
│       └── http-exception.filter.ts    # Error handling
│
├── modules/                            # Feature modules
│   ├── auth/
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       └── users.service.ts
│
└── database/
    ├── entities/
    │   └── user.entity.ts
    └── migrations/
        └── 20260319214500-CreateUsersTable.ts
```