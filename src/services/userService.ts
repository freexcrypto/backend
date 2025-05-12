import { getUserById } from "../repositories/userRepository";
import { User } from "../models/User";
import supabase from "../config/supabase";

export async function getUserProfile(id: string): Promise<User | null> {
  return await getUserById(id);
}

export async function saveUserFromOnboarding(
  apiData: any,
  email: string,
  fullname: string,
  address: string,
  idNumber: string,
  idFile: string
): Promise<User> {
  const { apiKey, apiSecret } = apiData;
  const { data, error } = await supabase
    .from("user")
    .insert([
      {
        id: apiData.id.toString(),
        email,
        fullname,
        address,
        id_number: idNumber,
        id_file: idFile,
        status: "success_verification",
        apikey: apiKey,
        secretkey: apiSecret,
      },
    ])
    .single();
  if (error) throw error;
  return data as User;
}
