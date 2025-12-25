import { createClient } from "@refinedev/supabase";

const SUPABASE_URL = "https://cqwfsrrxruuzobgplgxl.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_qf_uXjoSy_JkPdyp6QS2Rg_Kwk1bWPD";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
