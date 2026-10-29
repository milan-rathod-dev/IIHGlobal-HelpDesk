export type Role = "employee" | "agent" | "admin";
export type Priority = "low" | "medium" | "high";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
};

export type Comment = {
  _id: string;
  text: string;
  author: User;
  createdAt: string;
};

export type Ticket = {
  _id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  createdBy: User;
  assignedTo?: User | null;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};
