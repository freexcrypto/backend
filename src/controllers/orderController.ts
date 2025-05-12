import { Request, Response } from "express";
import {
  createNewOrder,
  fetchOrderById,
  fetchAllOrders,
  fetchRecentPaidOrders,
  fetchOrdersByBusinessId,
} from "../services/orderService";
import supabase from "../config/supabase";
import { v4 as uuidv4 } from "uuid";

export async function orderOnboardingHandler(req: Request, res: Response) {
  try {
    const {
      client_id,
      sender_address_wallet,
      business_id,
      expired_at,
      success_url,
      transaction_hash,
      items,
    } = req.body;
    if (!client_id) {
      return res.status(400).json({ error: "client_id is required" });
    }
    if (!business_id) {
      return res.status(400).json({ error: "business_id is required" });
    }
    if (!sender_address_wallet) {
      return res
        .status(400)
        .json({ error: "sender_address_wallet is required" });
    }
    if (!expired_at) {
      return res.status(400).json({ error: "expired_at is required" });
    }
    if (!success_url) {
      return res.status(400).json({ error: "success_url is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }
    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_name) {
        return res
          .status(400)
          .json({ error: `Product name is required for item ${i + 1}` });
      }
      if (!item.product_price) {
        return res
          .status(400)
          .json({ error: `Product price is required for item ${i + 1}` });
      }
      if (!item.quantity) {
        return res
          .status(400)
          .json({ error: `Product quantity is required for item ${i + 1}` });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          error: `Product quantity must be greater than 0 for item ${i + 1}`,
        });
      }
    }
    // Recalculate total_price from items
    const total_price = items.reduce(
      (sum: number, item: any) => sum + item.product_price * item.quantity,
      0
    );
    const id = uuidv4();
    const url = `https://api.cryptolink.io/v1/checkout/${id}?${business_id}`;
    // Fetch business wallet address
    const { data: business, error: businessError } = await supabase
      .from("business")
      .select("address_wallet")
      .eq("id", business_id)
      .single();
    if (businessError || !business) {
      return res
        .status(404)
        .json({ error: "Business wallet address not found" });
    }
    const destination_address_wallet = business.address_wallet;
    // Save the order to the database
    const order = await createNewOrder({
      id,
      client_id,
      chain_id: 1135,
      sender_address_wallet,
      business_id,
      destination_address_wallet,
      total_price,
      expired_at: new Date(expired_at),
      payment_url: url,
      success_url,
      status_message: "WAITING_FOR_PAYMENT",
      transaction_hash,
      items,
    });
    return res.status(201).json({ message: "Order created", order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateOrderStatusHandler(req: Request, res: Response) {
  try {
    const { id, statusMessage, transaction_hash } = req.body;
    if (!id || !statusMessage) {
      return res
        .status(400)
        .json({ error: "id and statusMessage are required" });
    }
    await supabase
      .from("order")
      .update({
        statusMessage,
        transaction_hash,
      })
      .eq("id", id);
    res.status(200).json({ message: "Order statuses updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrderByIdHandler(req: Request, res: Response) {
  try {
    const order = await fetchOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order fetched", data: order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAllOrdersHandler(_: Request, res: Response) {
  try {
    const orders = await fetchAllOrders();
    res.json({ message: "Orders fetched", data: orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRecentPaidOrdersHandler(req: Request, res: Response) {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;
    const orders = await fetchRecentPaidOrders(req.params.business_id, limit);
    res.json({ message: "Orders fetched", data: orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOrdersByBusinessIdHandler(
  req: Request,
  res: Response
) {
  try {
    const orders = await fetchOrdersByBusinessId(req.params.business_id);
    res.json({ message: "Orders fetched", data: orders });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
