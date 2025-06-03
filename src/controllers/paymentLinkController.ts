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
    const { business_id, title, description, amount, chain_id, chain_name } =
      req.body;

    if (
      !business_id ||
      !title ||
      !description ||
      !amount ||
      !chain_id ||
      !chain_name
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentLinkId = uuidv4();
    const payment_link = `${process.env.PAYMENT_LINK_BASE_URL}/pay/${paymentLinkId}`;
    const expired_at = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    // Parse amount as string to manipulate digits
    let amountStr = String(amount);
    const randomDigits = String(Math.floor(Math.random() * 1000)).padStart(
      3,
      "0"
    );

    let randomizedAmount;

    // if (amountStr.length === 1) {
    //   // Kalau jumlah digit hanya 1 (misal: 5)
    //   randomizedAmount = Number(`${amountStr}.${randomDigits}`);
    // } else {
    //   // Kalau lebih dari 1 digit, bisa tetap atau pakai logika lain
    //   randomizedAmount = Number(amountStr);
    // }

    const toInsert = {
      id: paymentLinkId,
      business_id,
      title,
      description,
      payment_link,
      amount: (randomizedAmount = Number(`${amountStr}.${randomDigits}`)),
      expired_at,
      status: "active",
      chain_id,
      chain_name,
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
    const { id, business_id, chain_id } = req.params;
    const paymentLink = await getPaymentLink(id);

    if (!paymentLink) {
      return res.status(404).json({ error: "Payment link not found" });
    }

    let contractAddress = "";

    if (chain_id === "4202") {
      contractAddress = "0xD63029C1a3dA68b51c67c6D1DeC3DEe50D681661";
    } else if (chain_id === "84532") {
      contractAddress = "0xDA76705ADE18F3ecd5cF5E90861dB160F4AE7F34";
    }

    console.log(contractAddress);

    const destination_address_wallet = await getBusinessWalletAddress(
      business_id
    );
    if (!destination_address_wallet) {
      return res.status(404).json({ error: "Business not found" });
    }

    const formattedAmount = parseUnits(paymentLink.amount.toString(), 2);

    const url = `ethereum:${contractAddress}/transfer?address=${destination_address_wallet}&uint256=${formattedAmount}`;

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
