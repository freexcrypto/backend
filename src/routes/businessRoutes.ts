import { RequestHandler, Router } from "express";
import {
  businessOnboardingHandler,
  getAllBusinessesHandler,
  getBusinessByIdHandler,
  updateBusinessHandler,
  getBusinessByUserIdHandler,
} from "../controllers/businessController";

const router = Router();

router.post("/onboarding", businessOnboardingHandler as RequestHandler);
router.get("/", getAllBusinessesHandler as RequestHandler);
router.get("/:business_id", getBusinessByIdHandler as RequestHandler);

router.put("/:business_id", updateBusinessHandler as RequestHandler);
router.get("/by-user/:user_id", getBusinessByUserIdHandler as RequestHandler);

export default router;
