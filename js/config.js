// ============================================================
// CONFIGURATION SUPABASE
// Remplacez ces valeurs par celles de votre projet Supabase
// Tableau de bord Supabase > Settings > API
// ============================================================

const SUPABASE_URL = "https://wrkswbubfiesiapahbas.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indya3N3YnViZmllc2lhcGFoYmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjA2MjgsImV4cCI6MjA4OTA5NjYyOH0.MjXg5Ut-YnFHWKAtqE22w8q48oEXsr-hL0ZAASgasrE";

// ============================================================
// NE PAS MODIFIER EN DESSOUS
// ============================================================

const supabaseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": "Bearer " + SUPABASE_ANON_KEY
};

async function supabaseFetch(endpoint, options = {}) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + endpoint, {
    headers: supabaseHeaders,
    ...options
  });
  if (!res.ok) throw new Error("Erreur Supabase : " + res.status);
  return res.json();
}
