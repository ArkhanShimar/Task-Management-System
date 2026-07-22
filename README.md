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

## Recycle bin and task dates

Deleting a task now performs a soft delete by setting `deleted_at`. Recycle-bin tasks can be restored or permanently removed. Expired items are permanently removed after five days whenever authenticated task data is loaded.

MySQL owns all lifecycle timestamps:

- `created_at` is filled when a row is inserted.
- `updated_at` changes automatically whenever a row is updated.
- `deleted_at` is set when a task moves to the recycle bin.

Run migrations again after pulling this version:

```bash
npm run db:migrate -w backend
```

Additional authenticated endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tasks/recycle-bin` | List recoverable tasks |
| DELETE | `/api/tasks/recycle-bin` | Empty the recycle bin |
| PATCH | `/api/tasks/:id/restore` | Restore a deleted task |
| DELETE | `/api/tasks/:id/permanent` | Permanently delete a task |

Task search also accepts optional `fromDate` and `toDate` query parameters in `YYYY-MM-DD` format. Both bounds apply to the task due date and can be combined with title, status, and priority filters.

The appearance button switches between the shared light and dark palettes. The preference is saved locally and falls back to the operating-system preference on the first visit.

## Profile management

Authenticated users can manage their name, email address, and password from the **Manage profile** sidebar section.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/profile` | Load the current user's profile |
| PUT | `/api/profile` | Update name/email and optionally change password |

A password change requires both the current password and a new password containing at least six characters. Name, email, password, and duplicate-email rules are validated by the API and mirrored by the form for quicker feedback.

The seed creates only the required assessment account; it no longer inserts demonstration tasks. Seed values can be configured without changing source code:

```env
SEED_USER_NAME=Admin User
SEED_USER_EMAIL=admin@test.com
SEED_USER_PASSWORD=123456
```

The assessment email and password remain the defaults required by the brief. The login form itself starts empty and does not embed credentials into the UI.
