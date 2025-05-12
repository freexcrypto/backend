import { Request, Response } from "express";
import fs from "fs";
import { saveBusinessFromOnboarding } from "../services/businessService";
import { getUserById } from "../repositories/userRepository";
import supabase from "../config/supabase";

export async function businessOnboardingHandler(req: Request, res: Response) {
  try {
    const { user_id, nama, logo, deskripsi, address_wallet } = req.body;
    if (!user_id || !nama || !address_wallet) {
      return res
        .status(400)
        .json({ error: "user_id, nama, and address_wallet are required." });
    }

    // Check user verification status
    const user = await getUserById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Save business to your DB only (no third-party API call)
    const business = await saveBusinessFromOnboarding(
      user_id,
      nama,
      deskripsi || "",
      logo,
      address_wallet
    );
    return res.status(201).json({ message: "Business onboarded", business });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getAllBusinessesHandler(_: Request, res: Response) {
  try {
    const { data, error } = await supabase.from("business").select("*");
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Businesses found", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBusinessByIdHandler(req: Request, res: Response) {
  try {
    const { business_id } = req.params;
    const { data, error } = await supabase
      .from("business")
      .select("*")
      .eq("id", business_id)
      .single();
    if (error || !data)
      return res.status(404).json({ error: "Business not found" });
    res.json({ message: "Business found", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateBusinessHandler(req: Request, res: Response) {
  try {
    const {
      nama,
      deskripsi,
      bank_account_number,
      bank_account_name,
      bank_id,
      bank_code,
      maxAmountTransfer,
      address_wallet,
    } = req.body;
    if (
      !nama &&
      !deskripsi &&
      !bank_account_number &&
      !bank_account_name &&
      !bank_id &&
      !bank_code &&
      !maxAmountTransfer &&
      !address_wallet
    ) {
      return res
        .status(400)
        .json({ error: "At least one field must be provided to update." });
    }
    const { id } = req.params;
    const updateFields: any = {};
    if (nama) updateFields.nama = nama;
    if (deskripsi) updateFields.deskripsi = deskripsi;
    if (bank_account_number)
      updateFields.bank_account_number = bank_account_number;
    if (bank_account_name) updateFields.bank_account_name = bank_account_name;
    if (bank_id) updateFields.bank_id = bank_id;
    if (bank_code) updateFields.bank_code = bank_code;
    if (maxAmountTransfer) updateFields.maxAmountTransfer = maxAmountTransfer;
    if (address_wallet) updateFields.address_wallet = address_wallet;
    const { data, error } = await supabase
      .from("business")
      .update(updateFields)
      .eq("id", id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Business updated", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBusinessByUserIdHandler(req: Request, res: Response) {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from("business")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Business not found" });
    }
    return res.json({ message: "Business found", data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
