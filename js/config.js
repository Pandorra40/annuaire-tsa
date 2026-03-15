const SUPABASE_URL = "SUPABASE_URL_PLACEHOLDER";
const SUPABASE_ANON_KEY = "SUPABASE_KEY_PLACEHOLDER.MjXg5Ut-YnFHWKAtqE22w8q48oEXsr-hL0ZAASgasrE";

const supabaseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": "Bearer " + SUPABASE_ANON_KEY,
  "Prefer": "return=minimal"
};

async function supabaseFetch(endpoint, options = {}) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + endpoint, {
    headers: supabaseHeaders,
    ...options
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Erreur Supabase : " + res.status + " — " + err);
  }
  if (res.status === 204) return {};
  const text = await res.text();
  if (!text) return {};
  return JSON.parse(text);
}
