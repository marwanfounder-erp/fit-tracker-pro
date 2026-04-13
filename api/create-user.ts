import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
  // Service key — set in Vercel env WITHOUT "VITE_" prefix so it stays server-side only
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  if (!serviceKey) return res.status(500).json({ error: "Server misconfigured: missing SUPABASE_SERVICE_KEY" });

  // Verify the calling user's JWT
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  // Admin client (service role — bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Confirm caller is admin
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (profile?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const { email, password, full_name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  // Create user — email_confirm: true skips confirmation email
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || "" },
  });

  if (error) return res.status(400).json({ error: error.message });

  // Upsert profile (trigger auto-creates it, but ensure full_name is set)
  if (data.user) {
    await adminClient.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      full_name: full_name || "",
      role: "user",
    });
  }

  return res.status(200).json({ user: data.user });
}
