import type { Response } from "express";
import { Ticket } from "../models/ticket.model";
import type { AuthRequest } from "../types";
import { HttpError } from "../utils/http-error";

const support = (role: string) => role === "agent" || role === "admin";

const refs = [
  { path: "createdBy", select: "name email role" },
  { path: "assignedTo", select: "name email role" },
  { path: "comments.author", select: "name email role" },
];

export async function listTickets(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const page = Number(req.query.page ?? 1),
    limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    throw new HttpError(400, "Invalid pagination");
  const filter: Record<string, unknown> = {};

  if (!support(req.user!.role)) filter.createdBy = req.user!.id;

  if (req.query.status) {
    if (
      !["open", "in_progress", "resolved", "closed"].includes(
        String(req.query.status),
      )
    )
      throw new HttpError(400, "Invalid status");
    filter.status = req.query.status;
  }

  if (req.query.priority) {
    console.log("Priority filter:", req.query.priority);
    if (!["low", "medium", "high"].includes(String(req.query.priority)))
      throw new HttpError(400, "Invalid priority");
    filter.priority = req.query.priority;
  }

  if (req.query.search)
    filter.title = {
      $regex: String(req.query.search)
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate(refs)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Ticket.countDocuments(filter),
  ]);
  res.json({
    tickets,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function createTicket(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { title, description, priority } = req.body;
  if (
    typeof title !== "string" ||
    title.trim().length < 5 ||
    title.trim().length > 10
  )
    throw new HttpError(400, "Title must be 5–10 characters");
  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 10000
  )
    throw new HttpError(
      400,
      "Description is required (up to 10000 characters)",
    );
  if (priority !== undefined && !["low", "medium", "high"].includes(priority))
    throw new HttpError(400, "Invalid priority");
  const ticket = await Ticket.create({
    title: title.trim(),
    description: description.trim(),
    priority: priority ?? "medium",
    createdBy: req.user!.id,
  });
  await ticket.populate(refs);
  res.status(201).json({ ticket });
}

export async function getTicket(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const ticket = await Ticket.findById(req.params.id).populate(refs);
  if (!ticket) throw new HttpError(404, "Ticket not found");
  if (
    !support(req.user!.role) &&
    String((ticket as any).createdBy._id) !== req.user!.id
  )
    throw new HttpError(403, "Forbidden");
  res.json({ ticket });
}

export async function updateTicket(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new HttpError(404, "Ticket not found");
  const { status, assignToMe } = req.body;
  if (status === undefined && assignToMe === undefined)
    throw new HttpError(400, "Provide status or assignToMe");
  if (status !== undefined) {
    if (!support(req.user!.role))
      throw new HttpError(403, "Only support agents can change status");
    if (!["open", "in_progress", "resolved", "closed"].includes(status))
      throw new HttpError(400, "Invalid status");
    ticket.status = status;
  }
  if (assignToMe !== undefined) {
    if (!support(req.user!.role))
      throw new HttpError(403, "Only support agents can assign tickets");
    if (assignToMe !== true)
      throw new HttpError(400, "assignToMe must be true");
    ticket.assignedTo = req.user!.id as any;
  }
  await ticket.save();
  await ticket.populate(refs);
  res.json({ ticket });
}

export async function addComment(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const { text } = req.body;
  if (typeof text !== "string" || !text.trim() || text.trim().length > 5000)
    throw new HttpError(400, "Comment is required (up to 5000 characters)");
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new HttpError(404, "Ticket not found");
  if (!support(req.user!.role) && String(ticket.createdBy) !== req.user!.id)
    throw new HttpError(403, "Forbidden");
  ticket.comments.push({
    text: text.trim(),
    author: req.user!.id as any,
    createdAt: new Date(),
  } as any);
  await ticket.save();
  await ticket.populate(refs);
  res.status(201).json({ ticket });
}

export async function deleteTicket(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new HttpError(404, "Ticket not found");
  if (String(ticket.createdBy) !== req.user!.id)
    throw new HttpError(403, "Only the owner can delete this ticket");
  if (ticket.status !== "open")
    throw new HttpError(400, "Only open tickets can be deleted");
  await ticket.deleteOne();
  res.status(204).end();
}
