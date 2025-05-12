import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

const tables = ["payment_links", "users", "business", "order"];
for (const table of tables) {
  supabase
    .channel(`public:${table}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        console.log(`Realtime event on ${table}:`, payload);
      }
    )
    .subscribe();
}
