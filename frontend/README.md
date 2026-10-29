# Helpdesk Lite frontend

React, TypeScript, Vite, and Tailwind CSS client for the Helpdesk Lite API.

## Setup and run

1. Start the backend first by following [`../backend/README.md`](../backend/README.md).
2. From `frontend/`, install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

3. Open the URL printed by Vite, usually `http://localhost:5173`.
4. If the API is not at `http://localhost:3000/api`, copy `.env.example` to `.env`, set `VITE_API_URL`, and restart Vite.

## User flow

1. Sign up as an employee or sign in with an existing account. The client stores the returned JWT and checks the current profile on reload. Missing or expired sessions are redirected to login.
2. Employees see and search/filter their own tickets. Agents and admins see all tickets and can create tickets too.
3. Open a ticket to view its details and comments. Ticket owners, agents, and admins can reply. The owner can delete an open ticket.
4. Agents and admins can assign a ticket to themselves and change its status. Employees see a message explaining that only support agents can change status.
5. Admins have a Users tab on the dashboard to search/filter users, paginate the directory, and change roles.

## Frontend structure

```text
src/
  components/   Header, badges, spinner, route guard, admin user directory
  context/      Authenticated session and toast notifications
  pages/        Login/signup, ticket dashboard, ticket details
  lib/          API client
  types.ts      Shared frontend data types
  App.tsx       Routes and providers
  index.css     Tailwind directives and global base styles
```

Tailwind styles are configured in `tailwind.config.js` and processed by PostCSS. Loading indicators and success, error, and warning toasts are used throughout the client.

## Scripts

- `npm run dev` — start the Vite development server.
- `npm run build` — typecheck and create the production build in `dist/`.
- `npm run preview` — preview the built frontend locally.
