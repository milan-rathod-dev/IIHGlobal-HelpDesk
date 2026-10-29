import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { User } from "../models/user.model";
import type { AuthRequest } from "../types";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";
const viewUser = (user: any) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});
const tokenFor = (user: any) =>
  jwt.sign(viewUser(user), env.jwtSecret, { expiresIn: "1d" });

export async function signup(
  request: AuthRequest,
  response: Response,
): Promise<void> {
  const { name, email, password } = request.body;
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 80 ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 100
  )
    throw new HttpError(
      400,
      "Enter a valid name, email and password (8–100 characters)",
    );
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: "employee",
  });
  response.status(201).json({ token: tokenFor(user), user: viewUser(user) });
}

export async function login(
  request: AuthRequest,
  response: Response,
): Promise<void> {
  const { email, password } = request.body;
  if (typeof email !== "string" || typeof password !== "string")
    throw new HttpError(400, "Email and password required");
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw new HttpError(401, "Invalid email or password");
  response.json({ token: tokenFor(user), user: viewUser(user) });
}

export async function profile(
  request: AuthRequest,
  response: Response,
): Promise<void> {
  const user = await User.findById(request.user?.id).select("-password");
  if (!user) throw new HttpError(404, "User not found");
  response.json({ user: viewUser(user) });
}
