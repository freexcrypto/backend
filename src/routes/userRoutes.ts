import { Router, RequestHandler } from "express";
import {
  getUserProfileHandler,
  onboardingHandler,
  updateUserProfileHandler,
  verifyUserHandler,
} from "../controllers/userController";

const router = Router();

router.get("/:id", getUserProfileHandler as RequestHandler);

router.post("/onboarding", onboardingHandler as RequestHandler);

router.put("/:id", updateUserProfileHandler as RequestHandler);

router.put("/:id/verify", verifyUserHandler as RequestHandler);
export default router;
