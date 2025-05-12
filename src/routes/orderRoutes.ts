import { RequestHandler, Router } from "express";
import {
  orderOnboardingHandler,
  updateOrderStatusHandler,
  getOrderByIdHandler,
  getAllOrdersHandler,
  getRecentPaidOrdersHandler,
  getOrdersByBusinessIdHandler,
} from "../controllers/orderController";

const router = Router();

router.post("/onboarding", orderOnboardingHandler as RequestHandler);
router.post("/update-status/:id", updateOrderStatusHandler as RequestHandler);
router.get("/", getAllOrdersHandler as RequestHandler);
router.get("/:id", getOrderByIdHandler as RequestHandler);
router.get(
  "/:business_id/recent-paid",
  getRecentPaidOrdersHandler as RequestHandler
);
router.get(
  "/business/:business_id",
  getOrdersByBusinessIdHandler as RequestHandler
);

export default router;
