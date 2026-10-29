import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthRequest, AuthUser } from "../types";
import { HttpError } from "../utils/http-error";
import { User } from "../models/user.model";

export async function authenticate(
  request: AuthRequest,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  const token = request.headers.authorization?.replace(/^Bearer\s+/, "");

  if (!token) return next(new HttpError(401, "Authentication required"));
  
  try {
    const claims = jwt.verify(token, env.jwtSecret) as AuthUser;
    const user = await User.findById(claims.id).select("_id name email role");
    if (!user) return next(new HttpError(401, "User account no longer exists"));
    request.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    } as AuthUser;
    next();
  } catch (error) {
    next(
      error instanceof HttpError
        ? error
        : new HttpError(401, "Invalid or expired token"),
    );
  }
}

export function allowRoles(...roles: AuthUser["role"][]) {
  return (
    request: AuthRequest,
    _response: Response,
    next: NextFunction,
  ): void => {
    if (!request.user || !roles.includes(request.user.role))
      return next(new HttpError(403, "Forbidden"));
    next();
  };
}
