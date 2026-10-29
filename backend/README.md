# Helpdesk Lite API

TypeScript, Express, and MongoDB API for Helpdesk Lite. The API handles authentication, role checks, ticket workflows, comments, and administrator user management.

## Setup

1. Install Node.js 20 or later.
2. From `backend/`, install packages:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

4. Open `.env` and make sure it contains these exact key/value entries from `.env.example` (copy them as-is if you are setting up the project):
   ```dotenv
   PORT=3000
   MONGODB_URI=mongodb+srv://milanrathod9080:DgSXCnAqXLKk5qJH@mytestdb.ykmbdhi.mongodb.net/
   JWT_SECRET=8492f3eff80899dbb849c9387e421aecb7580bf66373d47ba6fb4691c8b754db
   CORS_ORIGIN=http://localhost:5173
   SEED_PASSWORD=ChangeMe123!
   ```

   `MONGODB_URI` must be the Atlas connection string for the cluster you use. If Atlas changes the connection string, update this value in both `.env` and `.env.example`. Keep the URI on one line. The other variable names must also match exactly; the backend reads `PORT`, `JWT_SECRET`, `CORS_ORIGIN`, and `SEED_PASSWORD`.

5. Start the backend:
   ```bash
   npm run dev
   ```

The API listens on `http://localhost:3000` by default. Keep `.env` private; it is ignored by Git. Commit `.env.example` only.

## Seed accounts

To create the demo users in a fresh database, run this from `backend/`:

```bash
npm run seed
```

The seeder is safe to run again: it creates missing users and restores their expected roles. It does not reset existing users’ passwords. All four accounts use the password configured as `SEED_PASSWORD`:

| Role | Email | Pass
| --- | --- | --- |
| Admin | `admin@helpdesk.local` | `ChangeMe123!` |
| Agent | `agent@helpdesk.local` | `ChangeMe123!` |
| Employee | `employee1@helpdesk.local` | `ChangeMe123!` |
| Employee | `employee2@helpdesk.local` | `ChangeMe123!` |

For an existing database that already contains these accounts, seeding again is optional.

## Request flow

1. Sign up or log in. Passwords are hashed, and successful authentication returns a one-day JWT.
2. Send the token in `Authorization: Bearer <token>` for protected routes. `GET /api/auth/me` returns the current profile without a password.
3. Employees can create tickets and see only their own. Agents and admins can see all tickets, assign tickets to themselves, and change ticket status.
4. Ticket owners, agents, and admins can comment. Only the ticket owner can delete a ticket, and only while it is open.
5. Admins can search and filter the user directory and change user roles.

## API routes

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | Create an employee account |
| `POST` | `/api/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/api/auth/me` | Signed in | Get the current profile |
| `GET` | `/api/health` | Public | Check API and database status |
| `GET` | `/api/tickets` | Signed in | List tickets with `search`, `status`, `priority`, `page`, and `limit` filters |
| `POST` | `/api/tickets` | Signed in | Create a ticket |
| `GET` | `/api/tickets/:id` | Ticket owner or support | Get ticket details and comments |
| `PATCH` | `/api/tickets/:id` | Agent or admin | Set `status` and/or `{ "assignToMe": true }` |
| `POST` | `/api/tickets/:id/comments` | Ticket owner or support | Add a comment |
| `DELETE` | `/api/tickets/:id` | Ticket owner, while open | Delete a ticket |
| `GET` | `/api/users` | Admin | Search/filter users with `search`, `role`, `page`, and `limit` |
| `PATCH` | `/api/users/:id/role` | Admin | Change a user role |

Ticket titles must be 5–10 characters. Valid priorities are `low`, `medium`, and `high`; valid statuses are `open`, `in_progress`, `resolved`, and `closed`.

## Scripts

- `npm run dev` — run the API with Nodemon.
- `npm run seed` — seed demo users.
- `npm run typecheck` — check TypeScript types.
- `npm run build` — compile to `dist/`.
- `npm start` — run the compiled server.

## Structure

```text
src/
  config/        Environment and database connection
  controllers/   Request handling and business rules
  middleware/    Authentication and central error handling
  models/        Mongoose user and ticket models
  routes/        Auth, ticket, user, and health routes
  types/         Shared request and role types
  utils/         Async route wrapper and HTTP errors
```
