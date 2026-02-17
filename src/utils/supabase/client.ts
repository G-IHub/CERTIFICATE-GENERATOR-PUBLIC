import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

// Create Supabase client for browser usage
export const supabase = createSupabaseClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);