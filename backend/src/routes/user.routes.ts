import { Router } from "express";
import { changeRole, listUsers } from "../controllers/user.controller";
import { allowRoles, authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const userRouter = Router();

userRouter.get(
  "/",
  authenticate,
  allowRoles("admin"),
  asyncHandler(listUsers),
);

userRouter.patch(
  "/:id/role",
  authenticate,
  allowRoles("admin"),
  asyncHandler(changeRole),
);
