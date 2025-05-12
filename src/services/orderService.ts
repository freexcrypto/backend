import {
  createOrder,
  getOrderById,
  getAllOrders,
  getRecentPaidOrders,
  getOrdersByBusinessId,
} from "../repositories/orderRepository";
import { Order } from "../models/Order";

export async function createNewOrder(order: Partial<Order>): Promise<Order> {
  return await createOrder(order);
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  return await getOrderById(id);
}

export async function fetchAllOrders(): Promise<Order[]> {
  return await getAllOrders();
}

export async function fetchRecentPaidOrders(
  business_id: string,
  limit: number = 10
): Promise<Order[]> {
  return await getRecentPaidOrders(business_id, limit);
}

export async function fetchOrdersByBusinessId(
  business_id: string
): Promise<Order[]> {
  return await getOrdersByBusinessId(business_id);
}

// export async function updateOrderStatus(order: Partial<Order>): Promise<Order> {
//   return await updateOrder(order);
// }
