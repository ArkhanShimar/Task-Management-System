# Daymark Task Manager

Daymark is a full-stack task management app built for the Koncepthive internship assessment. It gives one authenticated user a clear overview of daily work and a focused place to create, find, update, and finish tasks.

## Features

- JWT login and logout with a seeded assessment account
- Dashboard totals for all, pending, in-progress, completed, and overdue tasks
- Complete task CRUD with confirmation before deletion
- Debounced title search and combinable status/priority filters
- Newest, oldest, and due-date sorting
- Matching frontend and backend validation
- Responsive desktop, tablet, and mobile layouts
- Loading skeletons, empty states, and toast feedback

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router, date-fns, Lucide icons, Sonner
- **Backend:** Node.js, Express, TypeScript, Zod, JWT, bcrypt
- **Database:** MySQL 8 with mysql2 connection pooling
- **Testing:** Vitest

## Project structure

```text
frontend/   React application and UI
backend/    REST API, validation, auth, and database scripts
database/   Standalone SQL schema copy
```

## Local setup

Requirements: Node.js 20+, npm 10+, and MySQL 8+.

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/ArkhanShimar/Task-Management-System.git
   cd Task-Management-System
   npm install
   ```

2. Create the MySQL database:

   ```sql
   CREATE DATABASE daymark CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Copy `backend/.env.example` to `backend/.env`, then update the database values and JWT secret. The frontend only needs `frontend/.env` if the API is not available through Vite's default `/api` proxy.

4. Prepare the tables and sample account:

   ```bash
   npm run db:migrate -w backend
   npm run db:seed -w backend
   ```

5. Start both applications:

   ```bash
   npm run dev
   ```

Open http://localhost:5173. The API runs on http://localhost:4000.

### Default login

- Email: `admin@test.com`
- Password: `123456`

The seed stores a bcrypt hash, not the plain-text password.

## Environment variables

### Backend

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | API port | `4000` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `JWT_SECRET` | Token signing secret | a long random value |
| `JWT_EXPIRES_IN` | Login lifetime | `8h` |
| `DB_HOST` / `DB_PORT` | MySQL server | `localhost` / `3306` |
| `DB_NAME` | Database name | `daymark` |
| `DB_USER` / `DB_PASSWORD` | MySQL credentials | local credentials |

### Frontend

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_URL` | API base path or URL | `/api` |

## API

All task endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/tasks` | List tasks with optional query parameters |
| GET | `/api/tasks/summary` | Dashboard totals |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Replace editable task fields |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/health` | Health check |

List query parameters are `search`, `status`, `priority`, and `sort` (`newest`, `oldest`, or `due_date`).

Example task body:

```json
{
  "title": "Prepare meeting notes",
  "description": "Summarize the open decisions",
  "priority": "high",
  "status": "in_progress",
  "dueDate": "2026-07-23"
}
```

## Quality checks

```bash
npm run build
npm test
```

## Design decisions and assumptions

- Tasks belong to a user even though only one account is required. This prevents a later multi-user change from needing a schema rewrite.
- Filtering and sorting happen in MySQL so the API remains the source of truth.
- Dates are returned as strings to avoid accidental timezone shifts on date-only due dates.
- Overdue means before the current database date and not completed.
- The token is stored in local storage for assessment simplicity.

## Known limitations

- There is no registration or password recovery because the brief specifies a single seeded login.
- JWTs cannot be revoked before their eight-hour expiry. A production version would use short-lived access tokens and rotating refresh tokens in secure cookies.
- The current list has no pagination; it is appropriate for a personal daily task list but should be added for large datasets.
- Deployment URLs are not included because this repository is set up for local review.
