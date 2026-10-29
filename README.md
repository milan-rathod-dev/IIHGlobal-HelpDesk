# IIHGlobal HelpDesk

A help desk ticketing app built with React, TypeScript, Express, and MongoDB. Employees can create and track support requests; agents and admins can manage tickets; admins can search users and change their roles.

## Requirements

- Node.js 20 or later and npm
- A MongoDB database reachable by the backend (MongoDB Atlas or a local instance)

## Run locally

The backend and frontend run as separate npm projects. Start each one in its own terminal.

### 1. Clone the repository

```bash
git clone https://github.com/milan-rathod-dev/IIHGlobal-HelpDesk.git
cd IIHGlobal-HelpDesk
```

### 2. Configure and start the backend

For more information about backend setup and the initial run, refer to the [backend README](backend/README.md).

In the first terminal:

```bash
cd backend
npm ci
cp .env.example .env
```

Edit `backend/.env` and set the values for your environment:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `3000` |
| `MONGODB_URI` | Connection string for your MongoDB database |
| `JWT_SECRET` | Signing key for login tokens; at least 24 characters |
| `CORS_ORIGIN` | Frontend origin allowed by the API; use `http://localhost:5173` for local development |
| `SEED_PASSWORD` | Password assigned to demo users created by the seeder; at least 8 characters |

For MongoDB Atlas, use a connection string for a database you can access and allow your machine’s IP address in the Atlas network access settings. Keep the URI on one line. Do not commit your local `.env` file.

Create the demo users, then start the API:

```bash
npm run seed
npm run dev
```

The API is available at `http://localhost:3000/api`. Check its health at `http://localhost:3000/api/health`.

### 3. Start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The frontend uses `http://localhost:3000/api` by default. If your API runs at a different URL, copy `frontend/.env.example` to `frontend/.env`, set `VITE_API_URL`, and restart Vite.

## Sign in and use the app

The seeder creates these accounts if they do not already exist. They all use the password you configured as `SEED_PASSWORD` in `backend/.env`:

| Role | Email |
| --- | --- |
| Admin | `admin@helpdesk.local` |
| Agent | `agent@helpdesk.local` |
| Employee | `employee1@helpdesk.local` |
| Employee | `employee2@helpdesk.local` |

You can also sign up in the app; new accounts have the employee role.

- Employees can create tickets, search and filter their own requests, comment, and delete their own open tickets.
- Agents can view and manage tickets, assign tickets to themselves, update status, and comment.
- Admins can do agent tasks, search and filter the user directory, and change user roles.

The seeder can be run again. It creates missing demo accounts and restores their expected roles, but does not reset passwords on existing accounts.

## Useful commands

Run these commands from the indicated project directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend/` | `npm run dev` | Start the API in development mode |
| `backend/` | `npm run seed` | Create missing demo users |
| `backend/` | `npm run typecheck` | Check backend TypeScript types |
| `backend/` | `npm run build` | Compile the backend into `dist/` |
| `backend/` | `npm start` | Run the compiled backend |
| `frontend/` | `npm run dev` | Start the Vite development server |
| `frontend/` | `npm run build` | Type-check and build the frontend into `dist/` |
| `frontend/` | `npm run preview` | Preview the production frontend build locally |

## Project layout

```text
backend/   Express API, MongoDB models, authentication, ticket and user routes
frontend/  React application, pages, components, and API client
```

See [backend/README.md](backend/README.md) for API routes and backend details, and [frontend/README.md](frontend/README.md) for frontend behavior and structure.
