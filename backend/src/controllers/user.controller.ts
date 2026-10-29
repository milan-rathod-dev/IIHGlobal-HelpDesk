import type { Response } from "express";
import { User } from "../models/user.model";
import type { AuthRequest } from "../types";
import { HttpError } from "../utils/http-error";
const publicUser = (user: any) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export async function listUsers(
  request: AuthRequest,
  response: Response,
): Promise<void> {
  const {
    page: rawPage = "1",
    limit: rawLimit = "10",
    search,
    role,
  } = request.query;
  const page = Number(rawPage);
  const limit = Number(rawLimit);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new HttpError(400, "Invalid pagination values");
  }

  const filter: Record<string, unknown> = {};
  if (role) {
    if (!["employee", "agent", "admin"].includes(String(role)))
      throw new HttpError(400, "Invalid role filter");
    filter.role = role;
  }
  if (search) {
    const safeSearch = String(search)
      .slice(0, 100)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  response.json({
    users: users.map(publicUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function changeRole(
  request: AuthRequest,
  response: Response,
): Promise<void> {
  const { role } = request.body;
  if (!["employee", "agent", "admin"].includes(role))
    throw new HttpError(400, "Invalid role");
  const user = await User.findByIdAndUpdate(
    request.params.id,
    { role },
    { new: true, runValidators: true },
  )
    .select("name email role createdAt")
    .lean();
  if (!user) throw new HttpError(404, "User not found");
  response.json({ user: publicUser(user) });
}
