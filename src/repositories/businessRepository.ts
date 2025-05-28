import supabase from "../config/supabase";
import { Business } from "../models/Business";

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("business")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Business;
}

export async function getBusinessWalletAddress(
  id: string
): Promise<string | null> {
  // Fetch business wallet address
  const { data: business, error: businessError } = await supabase
    .from("business")
    .select("address_wallet")
    .eq("id", id)
    .single();
  if (businessError || !business) return null;
  return business.address_wallet;
}
