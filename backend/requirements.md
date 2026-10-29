Requirement Breakdown

1. Backend (Node.js + Express + Mongo)

Authentictaion : 

1. User should be able to sign up and login; password must be hashed
2. User JWT-based authentication; the app should be able to fetch the logged-in user's profile (without password)
3. Each user has a role: employee (default on sign-up), agent, or admin. Provide a way to seed one admin, one agent and two employees.

Tickets:

A ticket has :

1. title (string, required, 5-10 characters)
2. description (string, required)
3. priority (low/medium/high, default : medium)
4. status (open/in_progress/resolved/closed, default open)
5. createdBy, assignedTo (user references)
6. comments (text, author, createdAt)
7. createdAt, updatedAt (timestamps)

Design REST APIs so that : 

1. Any logged-in user can create a ticket.
2. Employees can list and view only their own tickets; agents and admins can see all tickets.
3. The ticket list supports search by title, filters by status and priority, and pagination with total count.
4. Viewing a ticket returns its comments.
5. agents and admins can change a ticket's status and assign a ticket to themselves.
6. The ticket owner, agent and admins can add comments.
7. Only the owner can delete a ticket, and only while its status is open.
8. Only an admin can change user's role.
9. Validate input on evry write and return proper status codes (400, 401, 403, 404).
10. Use one central error handler and keep secretes in evrionment variables (commit an example env file)


2. Frontend (React)

Authentication : 

1. Login/signup pages with JWT authentication and form validation.
2. Protected routes; redirect to login when the token is missing or expired.

Dashboard:

1. Display tickets as per the user's role.
2. Search by title, filter by status and priority and pagination.
3. Create a new ticket.
4. Show status and priority as coloured badeges.
5. Loading, empty and error states.

Ticket Details Page.

1. Show the ticket's details (title, description, priority, status, created by, assigned to) and its comments.
2. Any user who can view the ticket can add a commet.
3. Agents and admins see an "Assign to me" button and a status dropdown.
4. Employees do not see these controls. Instead they see the message : "Only support agents can change the status of this ticket"


Agent and admins see "Assign to me" and a status dropdown. and comments; allow adding a comment.
