export interface User {
  id: string;
  email: string;
  fullname?: string;
  address?: string;
  id_number?: string;
  id_file?: string;
  status: "pending_verification" | "success_verification";
  apikey?: string;
  secretkey?: string;
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
}
