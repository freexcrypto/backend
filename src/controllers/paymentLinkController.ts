import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  createPaymentLink,
  getAllPaymentLinks,
  getPaymentLink,
  updatePaymentLink,
  getRecentPaidPaymentLinks,
} from "../repositories/paymentLinkRepository";

export const createPaymentLinkHandler = async (req: Request, res: Response) => {
  try {
    const { business_id, title, description, amount } = req.body;

    if (!business_id || !title || !description || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentLinkId = uuidv4();
    const payment_link = `${process.env.PAYMENT_LINK_BASE_URL}/pay/${paymentLinkId}`;
    const expired_at = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    const toInsert = {
      id: paymentLinkId,
      business_id,
      title,
      description,
      payment_link,
      amount,
      expired_at,
      status: "active",
    };

    const saved = await createPaymentLink(toInsert);

    res.status(201).json({
      message: "Payment link created successfully",
      data: saved,
    });
  } catch (error) {
    console.error(error); //
    res.status(500).json({ error: "Failed to create payment link" });
  }
};

export const getPaymentLinkHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing payment link ID" });
    }

    const paymentLink = await getPaymentLink(id);
    if (!paymentLink) {
      return res.status(404).json({ error: "Payment link not found" });
    }
    res.json({ message: "Payment link found", data: paymentLink });
  } catch (error) {
    console.error("Error in getPaymentLinkHandler:", error);
    res.status(500).json({ error: "Failed to get payment link" });
  }
};

export const getAllPaymentLinksHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { business_id } = req.params;
    const paymentLinks = await getAllPaymentLinks(business_id);
    res.json({ data: paymentLinks });
  } catch (error) {
    console.error(error); //
    res.status(500).json({ error: "Failed to get all payment links" });
  }
};

export const updatePaymentLinkHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sender_address_wallet, customer_name, transaction_hash, status } =
      req.body;

    const update = {
      sender_address_wallet,
      customer_name,
      transaction_hash,
      status,
    };

    const updated = await updatePaymentLink(id, update);
    res.json({ message: "Payment link updated", data: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment link" });
  }
};

export const getRecentPaidPaymentLinksHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { business_id } = req.params;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const paymentLinks = await getRecentPaidPaymentLinks(business_id, limit);
    res.json({ data: paymentLinks });
  } catch (error) {
    res.status(500).json({ error: "Failed to get recent paid payment links" });
  }
};
