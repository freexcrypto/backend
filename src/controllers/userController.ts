import { Request, Response } from "express";
import { getUserProfile } from "../services/userService";
// import axios from "axios";
// import FormData from "form-data";
// import fs from "fs";
// import path from "path";
import { User } from "../models/User";
import supabase from "../config/supabase";
// import { createSignature } from "../utils/createSignature";
// import { userOnboardingSchema, userUpdateSchema } from "../utils/validation";

export async function getUserProfileHandler(req: Request, res: Response) {
  try {
    const user = await getUserProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User found", data: user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function onboardingHandler(req: Request, res: Response) {
  try {
    const { id, email, fullname, address, idNumber } = req.body;
    if (!id || !email || !fullname) {
      return res
        .status(400)
        .json({ error: "id, email, and fullname are required." });
    }
    const { error } = await supabase
      .from("user")
      .insert([
        {
          id,
          email,
          fullname,
          address,
          id_number: idNumber,
          status: "pending_verification",
        },
      ])
      .single();
    if (error) throw error;
    const user = {
      id,
      email,
      fullname,
      address,
      id_number: idNumber,
      status: "pending_verification",
    };
    return res.status(201).json({ message: "User onboarded", user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function verifyUserHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data: user, error: userError } = await supabase
      .from("user")
      .select("*")
      .eq("id", id)
      .single();
    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }
    // --- Third-party API call logic goes here ---
    return res.json({ message: "Verification endpoint ready" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveUserFromOnboarding(
  apiData: any,
  id: string,
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
        id: id,
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

export async function updateUserProfileHandler(req: Request, res: Response) {
  try {
    const { email, fullname, address } = req.body;
    if (!email && !fullname && !address) {
      return res.status(400).json({
        error:
          "At least one field (email, fullname, address) is required to update.",
      });
    }
    const { id } = req.params;
    const updateFields: any = {};
    if (email) updateFields.email = email;
    if (fullname) updateFields.fullname = fullname;
    if (address) updateFields.address = address;
    const { data, error } = await supabase
      .from("user")
      .update(updateFields)
      .eq("id", id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
