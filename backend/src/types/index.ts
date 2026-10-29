import type { Request } from "express";
export type UserRole = "employee" | "agent" | "admin";
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface AuthRequest extends Request {
  user?: AuthUser;
}
