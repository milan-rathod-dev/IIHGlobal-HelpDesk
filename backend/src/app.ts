import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { ticketRouter } from "./routes/ticket.routes";
import { userRouter } from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";
export const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use((request: Request, _response: Response, next: NextFunction) => {
  if (["POST", "PATCH", "PUT"].includes(request.method)) {
    const body = request.body;
    if (
      body === undefined ||
      body === null ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      next(new Error("Request body must be a JSON object"));
      return;
    }
  }
  next();
});
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/users", userRouter);
app.use((_request, response) =>
  response.status(404).json({ message: "Route not found" }),
);
app.use(errorHandler);
