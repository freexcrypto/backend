import axios from "axios";
import { createSignature } from "../utils/createSignature";

export async function requestMintTransaction(payload: {
  toBeMinted: string;
  destinationWalletAddress: string;
  expiryPeriod: number;
  networkChainId: string;
  requestType?: string;
}) {
  const apiKey = process.env.IDRX_API_KEY!;
  const apiSecret = process.env.IDRX_API_SECRET!;
  const path = "https://idrx.co/api/transaction/mint-request";
  const timestamp = Math.round(Date.now()).toString();
  const sig = createSignature("POST", path, payload, timestamp, apiSecret);

  const response = await axios.post(path, payload, {
    headers: {
      "Content-Type": "application/json",
      "idrx-api-key": apiKey,
      "idrx-api-sig": sig,
      "idrx-api-ts": timestamp,
    },
  });

  if (response.data.message !== "success") {
    throw new Error("Mint request failed: " + response.data.message);
  }
  return response.data.data;
}
