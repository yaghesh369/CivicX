# CivicX Backend (Node.js)

Node.js/Express port of the CivicConnect backend spec — Django concepts mapped
1:1 onto Express + Prisma:

| Django/DRF concept        | This project                          |
|----------------------------|----------------------------------------|
| Django ORM models          | `prisma/schema.prisma`                |
| Django custom User model   | `User` model, `role` enum              |
| Simple JWT                 | `jsonwebtoken` (`src/utils/jwt.js`)    |
| DRF permission classes      | `src/middleware/role.js`               |
| DRF views                  | `*.controller.js` files                |
| DRF urls.py                | `*.routes.js` files                    |
| Pillow / image validation  | `multer` (`src/middleware/upload.js`)  |
| PostgreSQL / Neon           | Same — set `DATABASE_URL` in `.env`    |

## 1. Setup

```bash
cd civicx-backend
npm install
cp .env.example .env
# edit .env: paste your Neon DATABASE_URL and set JWT secrets
```

## 2. Database

```bash
npx prisma migrate dev --name init   # creates tables in Neon
npm run seed                          # creates departments + admin user
```

Seeded admin login: `admin@civicx.local` / `Admin@12345` — **change this in
production.**

## 3. Run

```bash
npm run dev     # nodemon, auto-restarts
# or
npm start
```

Server runs on `http://localhost:5000` by default.

## 4. Project structure

```
civicx-backend/
├── prisma/
│   ├── schema.prisma      # full data model (User, Complaint, Worker, etc.)
│   └── seed.js
├── src/
│   ├── app.js             # express app + route mounting
│   ├── server.js          # entrypoint
│   ├── config/prisma.js   # prisma client singleton
│   ├── middleware/        # auth, role, upload, error handler
│   ├── utils/              # jwt helpers, complaint number generator
│   └── modules/
│       ├── auth/            # register/login/refresh/logout
│       ├── complaints/      # CRUD, status workflow, timeline, assign,
│       │                    # verify, reopen, nearby, images, ai-analysis
│       ├── departments/     # departments + workers CRUD
│       ├── workers/         # worker creation routes
│       ├── notifications/
│       ├── feedback/
│       └── admin/           # dashboard, statistics, heatmap
└── uploads/                # uploaded complaint images (served at /uploads)
```

## 5. API Reference

All protected routes require `Authorization: Bearer <access_token>`.

### Auth
| Method | URL | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | No | `{name,email,password,phone?,language?,ward?}` → always creates a CITIZEN |
| POST | `/api/auth/login` | No | `{email,password}` → `{user, access, refresh}` |
| POST | `/api/auth/refresh` | No | `{refresh}` → `{access}` |
| POST | `/api/auth/logout` | Yes | Stateless — client discards tokens |
| GET | `/api/auth/me` | Yes | Returns the authenticated user profile |

### Complaints
| Method | URL | Auth | Notes |
|---|---|---|---|
| POST | `/api/complaints` | Any | Create complaint |
| GET | `/api/complaints` | Any | Filters: `category, status, ward, priority, department, search, page, page_size` (Citizens see only their own) |
| GET | `/api/complaints/my` | Any | Own complaints |
| GET | `/api/complaints/nearby?latitude=&longitude=&category=&radius_km=` | Any | Duplicate-detection candidate list |
| GET | `/api/complaints/:id` | Any | Owner or staff only |
| PATCH | `/api/complaints/:id` | Owner/Officer/Admin | |
| DELETE | `/api/complaints/:id` | Owner/Admin | |
| GET | `/api/complaints/:id/timeline` | Owner/staff | Full status history |
| PATCH | `/api/complaints/:id/status` | Worker/Officer/Admin | `{status, comment?}`, validated against workflow |
| POST | `/api/complaints/:id/assign` | Officer/Admin | `{workerId}` |
| POST | `/api/complaints/:id/verify` | Officer/Admin | SUBMITTED/REOPENED → VERIFIED |
| POST | `/api/complaints/:id/reopen` | Owner | RESOLVED/CITIZEN_VERIFIED → REOPENED |
| POST | `/api/complaints/:id/images` | Any (multipart `image` field) | `imageType`: BEFORE/AFTER/EVIDENCE |
| POST | `/api/complaints/:id/ai-analysis` | Any (Member 2's service) | `{category,priority,department,confidence,reason}` |
| GET | `/api/complaints/:id/ai-analysis` | Any | |
| POST | `/api/complaints/:id/duplicate-group` | Any | `{duplicateComplaintIds:[...]}` |
| POST | `/api/complaints/:id/feedback` | Owner | `{rating,comment}`, only after resolution |
| GET | `/api/complaints/:id/feedback` | Any | |

**Status workflow enforced server-side:**
`SUBMITTED → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CITIZEN_VERIFIED`
(plus `REJECTED` and `REOPENED` branches). Invalid transitions return `400`.

### Departments / Workers
| Method | URL | Auth |
|---|---|---|
| GET | `/api/departments` | Any |
| POST | `/api/departments` | Admin |
| PATCH | `/api/departments/:id` | Admin |
| GET | `/api/departments/:id/workers` | Officer/Admin |
| POST | `/api/workers` | Officer/Admin — creates WORKER user + profile |
| PATCH | `/api/workers/:id` | Officer/Admin — activate/deactivate/reassign |

### Notifications
| Method | URL | Auth |
|---|---|---|
| GET | `/api/notifications?is_read=` | Any |
| PATCH | `/api/notifications/:id/read` | Any (own only) |
| PATCH | `/api/notifications/read-all` | Any |

### Admin
| Method | URL | Auth |
|---|---|---|
| GET | `/api/admin/dashboard` | Officer/Admin |
| GET | `/api/admin/complaints` | Officer/Admin |
| GET | `/api/admin/statistics` | Officer/Admin |
| GET | `/api/admin/categories` | Officer/Admin |
| GET | `/api/admin/wards` | Officer/Admin |
| GET | `/api/admin/heatmap` | Officer/Admin |

## 6. What's intentionally left for you to extend

- **Rejecting/validating category enum values from AI service** — currently trusts input; add `express-validator` chains if you want stricter checks (the package is already installed).
- **Token blacklist for hard logout** — current logout is stateless (client just discards the token). Add a `RevokedToken` model if you need server-side invalidation.
- **Rate limiting per-route** (e.g. stricter on `/auth/login`) — only a global limiter is wired in `app.js`.
- **Image size/type errors from multer** aren't yet caught by a dedicated handler — they'll currently surface via the generic error handler; you can special-case `err instanceof multer.MulterError` in `errorHandler.js` for nicer messages.

## 7. Postman collection

Import these into Postman as a collection and set an environment variable
`base_url = http://localhost:5000` and `access_token` (paste after login) —
then every route above maps directly to a request.
