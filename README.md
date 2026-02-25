# SecureBlog — Secure Blog Platform (Public + Private + Social Feed)

A full-stack blog platform with JWT authentication, public/private blog management, social engagement (likes & comments), rate limiting, and structured logging.

---

## Architecture

```
┌─────────────────┐         ┌─────────────────────────────┐
│  Next.js 15     │  HTTP   │  NestJS 11 API              │
│  (App Router)   │ ──────► │  /api                       │
│  Port 3000      │         │  Port 4000                  │
└─────────────────┘         └──────────┬──────────────────┘
                                       │
                                       ▼
                            ┌─────────────────────┐
                            │  PostgreSQL          │
                            │  (via Prisma ORM)    │
                            └─────────────────────┘
```

| Layer     | Technology              | Purpose                                      |
|-----------|-------------------------|----------------------------------------------|
| Frontend  | Next.js 15, Tailwind CSS | App Router, SSR-ready, responsive UI         |
| Backend   | NestJS 11, TypeScript    | REST API, JWT auth, validation, rate limiting|
| ORM       | Prisma 6                | Type-safe DB access, migrations              |
| Database  | PostgreSQL              | Relational storage with indexes              |
| Auth      | JWT (access + refresh)  | Stateless auth with token refresh            |
| Logging   | Pino                    | Structured JSON logging                      |

---

## Database Schema

**4 models**: `User`, `Blog`, `Like`, `Comment`

- **User** — email (unique), name, passwordHash (bcrypt), role (USER/ADMIN)
- **Blog** — title, slug (unique, auto-generated), content, summary (auto from first 200 chars), isPublished flag
- **Like** — unique constraint on `(userId, blogId)` prevents duplicates
- **Comment** — content with user relation

Key indexes:
- `Blog(isPublished, createdAt DESC)` — optimized feed queries
- `Blog(userId)` — fast user blog lookups
- `Like(userId, blogId)` — unique constraint + index

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint    | Auth     | Description           |
|--------|-------------|----------|-----------------------|
| POST   | `/register` | Public   | Create account        |
| POST   | `/login`    | Public   | Get JWT tokens        |
| POST   | `/refresh`  | Public   | Refresh access token  |
| GET    | `/profile`  | Required | Get current user      |

### Blogs (`/api/blogs`) — Authenticated
| Method | Endpoint | Auth     | Description            |
|--------|----------|----------|------------------------|
| POST   | `/`      | Required | Create blog            |
| GET    | `/`      | Required | List own blogs         |
| GET    | `/:id`   | Required | Get own blog by ID     |
| PATCH  | `/:id`   | Required | Update own blog        |
| DELETE | `/:id`   | Required | Delete own blog        |

### Public (`/api/public`) — No Auth
| Method | Endpoint      | Auth   | Description                |
|--------|---------------|--------|----------------------------|
| GET    | `/feed`       | Public | Paginated published blogs  |
| GET    | `/blog/:slug` | Public | Blog by slug               |

### Likes (`/api/likes`) — Authenticated
| Method | Endpoint      | Auth     | Description       |
|--------|---------------|----------|-------------------|
| POST   | `/:blogId`    | Required | Toggle like       |

### Comments (`/api/comments`) — Authenticated
| Method | Endpoint       | Auth     | Description             |
|--------|----------------|----------|-------------------------|
| GET    | `/:blogId`     | Public   | List comments (paginated)|
| POST   | `/:blogId`     | Required | Add comment             |

---

## Security Features

- **Password hashing**: bcrypt with 12 salt rounds
- **JWT tokens**: Access (15 min) + Refresh (7 days), signed with env secrets
- **Input validation**: class-validator DTOs with whitelist stripping
- **Rate limiting**: Global 30 req/60s, public feed 60 req/60s (configurable)
- **CORS**: Restricted to configured frontend URL
- **Guards**: JWT auth guard + Roles guard (RBAC-ready)
- **Prisma constraints**: Unique indexes prevent duplicate likes

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** running locally (or Docker)
- **npm** or **yarn**

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** — edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/secure_blog?schema=public"
JWT_SECRET="your-jwt-secret-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-change-this"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

**Frontend** — `frontend/.env.local` is pre-configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Database Setup

```bash
cd backend

# Create database and apply schema
npx prisma migrate dev --name init

# (Optional) Seed demo data
npm run prisma:seed
```

Demo accounts after seeding:
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 4000)
cd backend
npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── main.ts                # App bootstrap (CORS, validation, prefix)
│   ├── app.module.ts          # Root module (all imports, global guards)
│   ├── auth/                  # JWT auth module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   ├── guards/jwt-auth.guard.ts, roles.guard.ts
│   │   ├── decorators/current-user, public, roles
│   │   └── dto/register, login
│   ├── blog/                  # Authenticated CRUD
│   │   ├── blog.controller.ts
│   │   ├── blog.service.ts
│   │   ├── utils/slug.util.ts
│   │   └── dto/create-blog, update-blog
│   ├── public/                # Public feed + blog-by-slug
│   ├── like/                  # Like toggle
│   ├── comment/               # Comments CRUD
│   ├── prisma/                # Prisma service (global)
│   └── logger/                # Pino structured logging (global)

frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout (AuthProvider + Navbar)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── feed/page.tsx         # Public paginated feed
│   │   ├── blog/[slug]/page.tsx  # Public blog detail
│   │   └── dashboard/
│   │       ├── page.tsx          # My blogs list
│   │       ├── new/page.tsx      # Create blog
│   │       └── edit/[id]/page.tsx # Edit blog
│   ├── components/
│   │   ├── Navbar, BlogCard, LikeButton
│   │   ├── CommentSection, CommentItem
│   │   ├── LoadingSpinner, ProtectedRoute
│   ├── contexts/AuthContext.tsx   # Auth state + token management
│   ├── lib/api.ts                # API client with auto-refresh
│   └── types/index.ts            # Shared TypeScript interfaces
```

---

## Design Decisions & Trade-offs

1. **Prisma 6 over 7**: Prisma 7 removed `url` from datasource schema — downgraded for stability.
2. **JWT in localStorage**: Simpler than httpOnly cookies; trade-off is XSS vulnerability (mitigated by input sanitization). For production, httpOnly cookies are recommended.
3. **Auto-generated slugs**: Derived from title with random suffix fallback for uniqueness.
4. **Optimistic UI for likes**: Immediate feedback with rollback on error — better UX.
5. **Global rate limiting + per-route overrides**: ThrottlerGuard globally with `@Throttle()` on public endpoints.
6. **Refresh token in DB-less flow**: Stored client-side; for production, store in DB with revocation support.

---

## Scaling to 1M+ Users

| Concern          | Current          | At Scale                                    |
|------------------|------------------|---------------------------------------------|
| Database         | Single PostgreSQL| Read replicas, connection pooling (PgBouncer)|
| Caching          | None             | Redis for feed, blog detail, session cache  |
| Rate limiting    | In-memory        | Redis-backed distributed rate limiting      |
| Search           | DB queries       | Elasticsearch for full-text blog search     |
| CDN              | None             | CloudFront/Vercel Edge for static assets    |
| Auth             | JWT + localStorage| httpOnly cookies, token revocation in Redis |
| Background jobs  | BullMQ (ready)   | Separate worker processes, email queues     |
| Monitoring       | Pino logs        | ELK/Datadog, APM, health checks             |
| Deployment       | Single server    | Kubernetes/ECS, auto-scaling, blue-green    |

---

## Scripts Reference

### Backend
```bash
npm run build          # Compile TypeScript
npm run start:dev      # Development with watch mode
npm run start:prod     # Production mode
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:push     # Push schema without migration
npm run prisma:seed     # Seed demo data
```

### Frontend
```bash
npm run dev            # Development server (port 3000)
npm run build          # Production build
npm run start          # Start production server
npm run lint           # ESLint check
```

---

## License

MIT
