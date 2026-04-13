/**
 * Seed script — inserts realistic workout logs for all users over the past 14 days.
 * Uses service_role key to bypass RLS.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-workouts.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jspdjvlvakaidltooesv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌  Set SUPABASE_SERVICE_ROLE_KEY env var before running.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Workout program (mirrors workoutProgram.ts) ───────────────────────────────
const PROGRAM = {
  monday:   { key: "monday",   title: "LOWER 1",  exercises: [
    { name: "Hack Squat",             sets: 2 },
    { name: "Leg Press",              sets: 2 },
    { name: "Calf Raises",            sets: 2 },
    { name: "Reverse Curl Hamstring", sets: 2 },
  ]},
  tuesday:  { key: "tuesday",  title: "UPPER 1",  exercises: [
    { name: "Flat Bench Press",   sets: 2 },
    { name: "Seated Cable Row",   sets: 2 },
    { name: "Overhead DB Press",  sets: 2 },
    { name: "Lat Pulldown",       sets: 2 },
    { name: "Tricep Extension",   sets: 2 },
    { name: "Hammer Curl",        sets: 2 },
    { name: "Lateral Raises",     sets: 2 },
  ]},
  thursday: { key: "thursday", title: "LOWER 2",  exercises: [
    { name: "Leg Extension",     sets: 2 },
    { name: "Reverse Curl",      sets: 2 },
    { name: "Seated Calf Raises",sets: 2 },
    { name: "Ab Crunches",       sets: 2 },
  ]},
  friday:   { key: "friday",   title: "UPPER 2",  exercises: [
    { name: "Incline DB Press",  sets: 2 },
    { name: "Wide Row",          sets: 2 },
    { name: "Pec Deck Flys",     sets: 2 },
    { name: "Cable Crossover",   sets: 2 },
    { name: "Triceps Pushdown",  sets: 2 },
    { name: "Bicep Curls",       sets: 2 },
  ]},
};

// Realistic base weights per exercise (kg) — will vary slightly per user/session
const BASE_WEIGHTS = {
  "Hack Squat":             80,
  "Leg Press":              120,
  "Calf Raises":            60,
  "Reverse Curl Hamstring": 40,
  "Flat Bench Press":       70,
  "Seated Cable Row":       55,
  "Overhead DB Press":      30,
  "Lat Pulldown":           60,
  "Tricep Extension":       25,
  "Hammer Curl":            20,
  "Lateral Raises":         12,
  "Leg Extension":          50,
  "Reverse Curl":           40,
  "Seated Calf Raises":     50,
  "Ab Crunches":            0,   // bodyweight
  "Incline DB Press":       28,
  "Wide Row":               55,
  "Pec Deck Flys":          40,
  "Cable Crossover":        15,
  "Triceps Pushdown":       30,
  "Bicep Curls":            18,
};

// ── Date helpers ──────────────────────────────────────────────────────────────
function dayName(date) {
  return ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][date.getDay()];
}

function toDateStr(date) {
  return date.toISOString().split("T")[0];
}

function pastDates(days) {
  const dates = [];
  for (let i = days; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

// ── Weight variation per user ─────────────────────────────────────────────────
function userMultiplier(userId) {
  // deterministic 0.7–1.3 based on first chars of UUID
  const n = parseInt(userId.replace(/-/g, "").slice(0, 4), 16);
  return 0.7 + (n % 1000) / 1666;
}

function jitter(base, sessionIdx) {
  // slight progression: each session adds ~1-2kg
  const progression = sessionIdx * 1.5;
  const noise = (Math.random() - 0.5) * 4;
  return Math.max(0, Math.round((base + progression + noise) * 2) / 2);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Fetch all non-admin users
  const { data: profiles, error: profileErr } = await sb
    .from("profiles")
    .select("id, full_name, email, role");

  if (profileErr) { console.error("profiles fetch error:", profileErr); process.exit(1); }
  console.log(`Found ${profiles.length} users: ${profiles.map(p => p.email || p.full_name).join(", ")}`);

  const dates = pastDates(21); // last 21 days → ensures 2+ full weeks of workout days

  let totalInserted = 0;

  for (const profile of profiles) {
    const mult = userMultiplier(profile.id);
    const rows = [];
    let sessionIdx = 0;

    for (const date of dates) {
      const day = dayName(date);
      const plan = PROGRAM[day];
      if (!plan) continue; // skip rest/cardio days

      sessionIdx++;
      const dateStr = toDateStr(date);

      for (const ex of plan.exercises) {
        const base = (BASE_WEIGHTS[ex.name] ?? 20) * mult;

        for (let s = 1; s <= ex.sets; s++) {
          const weight = BASE_WEIGHTS[ex.name] === 0 ? null : jitter(base, sessionIdx);
          const reps   = 8 + Math.floor(Math.random() * 5); // 8-12
          const rir    = Math.floor(Math.random() * 3);      // 0-2

          rows.push({
            session_date: dateStr,
            day_key:      plan.key,
            exercise_name: ex.name,
            set_number:   s,
            weight:       weight,
            reps:         reps,
            rir:          rir,
            user_id:      profile.id,
          });
        }
      }
    }

    // Insert in one batch per user
    const { error: insertErr } = await sb.from("workout_logs").insert(rows);
    if (insertErr) {
      console.error(`  ✗ ${profile.email} — ${insertErr.message}`);
    } else {
      console.log(`  ✓ ${profile.email || profile.id} — ${rows.length} sets inserted`);
      totalInserted += rows.length;
    }
  }

  console.log(`\n✅  Done — ${totalInserted} total sets inserted across ${profiles.length} users.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
