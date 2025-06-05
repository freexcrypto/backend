import { RequestHandler, Router } from "express";
import {
  createPaymentLinkHandler,
  getAllPaymentLinksHandler,
  getPaymentLinkHandler,
  updatePaymentLinkHandler,
  getRecentPaidPaymentLinksHandler,
  getQRCodeHandler,
} from "../controllers/paymentLinkController";

const router = Router();

router.post("/create", createPaymentLinkHandler as RequestHandler);

router.get(
  "/qr/:id/:business_id/:chain_id/:contract_address",
  getQRCodeHandler as RequestHandler
);

router.get(
  "/by-business/:business_id",
  getAllPaymentLinksHandler as RequestHandler
);
router.get("/:id", getPaymentLinkHandler as RequestHandler);

router.get(
  "/recent-paid/:business_id",
  getRecentPaidPaymentLinksHandler as RequestHandler
);

router.put("/:id", updatePaymentLinkHandler as RequestHandler);
export default router;
