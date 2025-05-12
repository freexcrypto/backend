import supabase from "../config/supabase";
import { User } from "../models/User";

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as User | null;
}
