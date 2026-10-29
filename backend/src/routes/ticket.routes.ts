import { Router } from "express";
import {
  addComment,
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "../controllers/ticket.controller";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const ticketRouter = Router();

ticketRouter.use(authenticate);
ticketRouter.get("/", asyncHandler(listTickets));
ticketRouter.post("/", asyncHandler(createTicket));
ticketRouter.get("/:id", asyncHandler(getTicket));
ticketRouter.patch("/:id", asyncHandler(updateTicket));
ticketRouter.post("/:id/comments", asyncHandler(addComment));
ticketRouter.delete("/:id", asyncHandler(deleteTicket));
