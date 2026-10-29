import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { HttpError } from "../utils/http-error";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (
    error instanceof Error &&
    error.message === "Request body must be a JSON object"
  ) {
    response.status(400).json({ message: error.message });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({ message: "Invalid JSON request body" });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ message: error.message });
    return;
  }

  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    response.status(400).json({ message: error.message });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    response.status(400).json({ message: "Email already in use" });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Internal server error" });
};
