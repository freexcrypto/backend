import supabase from "../config/supabase";

export async function createPaymentLink(data: any) {
  const { data: result, error } = await supabase
    .from("payment_links")
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function getPaymentLink(id: string) {
  const { data, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("id", id)
    .single();
  console.log(data);
  if (error) throw error;
  return data;
}

export async function getAllPaymentLinks(business_id: string) {
  const { data, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updatePaymentLink(id: string, update: any) {
  const { data, error } = await supabase
    .from("payment_links")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getRecentPaidPaymentLinks(
  business_id: string,
  limit: number = 10
) {
  const { data, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("status", "paid")
    .eq("business_id", business_id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
