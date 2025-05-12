import supabase from "../config/supabase";
import { Business } from "../models/Business";

export async function saveBusinessFromOnboarding(
  user_id: string,
  nama: string,
  deskripsi: string,
  logo: string,
  address_wallet: string
): Promise<Business> {
  const { data, error } = await supabase
    .from("business")
    .insert([
      {
        user_id,
        nama,
        deskripsi,
        logo,
        address_wallet,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data as Business;
}
