import { Database } from "@/types/supabase";
import { createBrowserClient as createClient } from "@supabase/ssr";

export function createBrowseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
