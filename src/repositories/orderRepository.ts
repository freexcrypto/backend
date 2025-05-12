import supabase from "../config/supabase";
import { Order, OrderItem } from "../models/Order";

export async function createOrder(order: Partial<Order>): Promise<Order> {
  // Destructure items from order
  const { items, ...orderData } = order;

  // 1. Insert order (without items)
  const { data: orderResult, error: orderError } = await supabase
    .from("order")
    .insert([orderData])
    .select()
    .single();
  if (orderError) throw orderError;

  // 2. Insert items with order_id
  let insertedItems: OrderItem[] = [];
  if (items && Array.isArray(items) && items.length > 0) {
    const itemsWithOrderId = items.map((item: any) => ({
      ...item,
      order_id: orderResult.id,
    }));
    const { data: itemResults, error: itemsError } = await supabase
      .from("order_item")
      .insert(itemsWithOrderId)
      .select();
    if (itemsError) throw itemsError;
    insertedItems = itemResults;
  }

  // 3. Return the order with its items
  return {
    ...orderResult,
    items: insertedItems,
  } as Order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from("order")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !order) return null;
  const { data: items } = await supabase
    .from("order_item")
    .select("*")
    .eq("order_id", id);
  return { ...order, items: items || [] } as Order;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data: orders, error } = await supabase.from("order").select("*");
  if (error || !orders) return [];
  // Fetch items for all orders
  const orderIds = orders.map((o: any) => o.id);
  const { data: items } = await supabase
    .from("order_item")
    .select("*")
    .in("order_id", orderIds);
  // Attach items to orders
  return orders.map((order: any) => ({
    ...order,
    items: (items || []).filter((item: any) => item.order_id === order.id),
  })) as Order[];
}

export async function getRecentPaidOrders(
  business_id: string,
  limit: number = 10
): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("order")
    .select("*")
    .eq("status_message", "paid")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !orders) return [];
  // Fetch items for all orders
  const orderIds = orders.map((o: any) => o.id);
  const { data: items } = await supabase
    .from("order_item")
    .select("*")
    .in("order_id", orderIds);
  // Attach items to orders
  return orders.map((order: any) => ({
    ...order,
    items: (items || []).filter((item: any) => item.order_id === order.id),
  })) as Order[];
}

export async function getOrdersByBusinessId(
  business_id: string
): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("order")
    .select("*")
    .eq("business_id", business_id);
  if (error || !orders) return [];
  // Fetch items for all orders
  const orderIds = orders.map((o: any) => o.id);
  const { data: items } = await supabase
    .from("order_item")
    .select("*")
    .in("order_id", orderIds);
  // Attach items to orders
  return orders.map((order: any) => ({
    ...order,
    items: (items || []).filter((item: any) => item.order_id === order.id),
  })) as Order[];
}
