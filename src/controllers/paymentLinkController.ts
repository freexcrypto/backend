import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  createPaymentLink,
  getAllPaymentLinks,
  getPaymentLink,
  updatePaymentLink,
  getRecentPaidPaymentLinks,
} from "../repositories/paymentLinkRepository";

import { parseUnits } from "viem";
import { getBusinessWalletAddress } from "../repositories/businessRepository";
import QRCode from "qrcode";

export const createPaymentLinkHandler = async (req: Request, res: Response) => {
  try {
    const {
      business_id,
      title,
      description,
      amount,
      chain_id,
      chain_name,
      recieve_token,
    } = req.body;

    if (
      !business_id ||
      !title ||
      !description ||
      !amount ||
      !chain_id ||
      !chain_name ||
      !recieve_token
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentLinkId = uuidv4();
    const payment_link = `${process.env.PAYMENT_LINK_BASE_URL}/pay/${paymentLinkId}`;
    const expired_at = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    // Generate random digits after decimal point (4-6 digits)
    const decimalPlaces = Math.floor(Math.random() * 3) + 4; // Random number between 4-6
    const randomDigits = String(
      Math.floor(Math.random() * Math.pow(10, decimalPlaces))
    ).padStart(decimalPlaces, "0");

    const randomizedAmount = Number(`0.00${randomDigits}`);

    const toInsert = {
      id: paymentLinkId,
      business_id,
      title,
      description,
      payment_link,
      amount: Number(amount) + randomizedAmount,
      expired_at,
      status: "active",
      chain_id,
      chain_name,
      recieve_token,
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
export const getQRCodeHandler = async (req: Request, res: Response) => {
  try {
    const { id, business_id, chain_id, contract_address } = req.params;
    const paymentLink = await getPaymentLink(id);

    if (!paymentLink) {
      return res.status(404).json({ error: "Payment link not found" });
    }

    const destination_address_wallet = await getBusinessWalletAddress(
      business_id
    );
    if (!destination_address_wallet) {
      return res.status(404).json({ error: "Business not found" });
    }

    const formattedAmount = parseUnits(paymentLink.amount.toString(), 18);

    const url = `ethereum:${contract_address}@${chain_id}/transfer?address=${destination_address_wallet}&uint256=${formattedAmount}`;

    const qrCode = await QRCode.toDataURL(url);

    res.json({ message: "QR code created", data: qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get QR code" });
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
    const {
      sender_address_wallet,
      customer_name,
      transaction_hash,
      status,
      sender_chain_name,
    } = req.body;

    const update = {
      sender_address_wallet,
      customer_name,
      transaction_hash,
      status,
      sender_chain_name,
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
