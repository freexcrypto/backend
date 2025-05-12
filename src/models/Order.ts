export interface Order {
  id: string;
  client_id: string;
  chain_id: number;
  sender_address_wallet?: string;
  business_id: string;
  destination_address_wallet: string;
  total_price: number;
  expired_at?: Date;
  payment_url?: string;
  success_url?: string;
  status_message?: string;
  transaction_hash?: string;
  created_at?: string;
  updated_at?: string;
  items: OrderItem[]; // Tambahkan ini!
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_name: string;
  product_price: number;
  quantity: number;
}
