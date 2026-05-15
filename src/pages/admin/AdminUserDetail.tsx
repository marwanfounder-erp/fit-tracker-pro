import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkoutProgram } from "@/hooks/useWorkoutProgram";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft, Dumbbell,
  ChevronDown, ChevronUp, Plus, X, RotateCcw,
} from "lucide-react";
import type { Exercise } from "@/data/workoutProgram";
import WorkoutProgress from "@/components/WorkoutProgress";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

interface Profile {
  id: string; email: string; full_name: string | null;
  role: string; created_at: string;
}
interface WorkoutLog {
  id: string; session_date: string; day_key: string;
  exercise_name: string; set_number: number;
  weight: number | null; reps: number | null; rir: number | null;
}
interface FoodLog {
  id: string; session_date: string; food_name: string; emoji: string;
  quantity: number; unit: string; total_protein: number; total_calories: number;
}

const unitLabel = (u: string) =>
  ({ g: "g", piece: "pcs", scoop: "scoops", slice: "slices" }[u] ?? u);

// ─── Program Editor (inline) ──────────────────────────────────────────────────
function ProgramEditor({ userId }: { userId: string }) {
  const { program, addExercise, removeExercise, resetToDefault } = useWorkoutProgram(userId);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSets, setNewSets] = useState("2");
  const [newReps, setNewReps] = useState("10");

  const handleAdd = async (dayKey: string) => {
    if (!newName.trim()) { toast.error("Enter an exercise name"); return; }
    const ex: Exercise = {
      name: newName.trim(),
      sets: parseInt(newSets) || 2,
      targetReps: newReps.trim() || "10",
      coachingNotes: "",
      youtubeSearch: newName.trim().replace(/\s+/g, "+") + "+proper+form",
    };
    await addExercise(dayKey, ex);
    setNewName(""); setNewSets("2"); setNewReps("10"); setAddingTo(null);
    toast.success("Exercise added");
  };

  return (
    <div className="border-2 border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-card">
        <h3 className="font-mono text-xs uppercase tracking-widest text-foreground">Workout Program</h3>
        <button
          onClick={async () => { await resetToDefault(); toast.success("Reset to default"); }}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Days */}
      <div className="divide-y divide-border">
        {program.map((day) => {
          const isExpanded = expandedDay === day.key;
          const isWorkout = day.type === "workout";
          return (
            <div key={day.key}>
              <button
                onClick={() => isWorkout && setExpandedDay(isExpanded ? null : day.key)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left ${isWorkout ? "hover:bg-iron-medium/40 transition-colors" : "cursor-default"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 ${isWorkout ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"}`}>
                    {day.label}
                  </span>
                  <div>
                    <p className="font-bold uppercase tracking-tight text-foreground text-sm">{day.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {isWorkout ? `${day.exercises.length} exercise${day.exercises.length !== 1 ? "s" : ""}` : day.type}
                    </p>
                  </div>
                </div>
                {isWorkout && (isExpanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />)}
              </button>

              {isExpanded && (
                <div className="bg-iron-medium/20 px-4 pb-4 space-y-1.5">
                  {day.exercises.length === 0 && (
                    <p className="font-mono text-xs text-muted-foreground py-2 text-center">No exercises yet</p>
                  )}
                  {day.exercises.map((ex, i) => (
                    <div key={ex.name} className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border">
                      <span className="font-mono text-[10px] text-muted-foreground w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs uppercase tracking-tight text-foreground truncate">{ex.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{ex.sets} sets · {ex.targetReps} reps</p>
                      </div>
                      <button onClick={() => removeExercise(day.key, ex.name)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                        <X size={13} />
                      </button>
                    </div>
                  ))}

                  {addingTo === day.key ? (
                    <div className="border-2 border-primary bg-card p-3 space-y-3 mt-2">
                      <input
                        type="text" placeholder="Exercise name" value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd(day.key)}
                        autoFocus
                        className="w-full bg-background border-2 border-border p-2 font-mono text-sm text-foreground focus:border-primary outline-none placeholder:text-muted-foreground"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sets</p>
                          <input type="number" value={newSets} onChange={(e) => setNewSets(e.target.value)}
                            className="w-full bg-background border-2 border-border p-2 font-mono text-sm text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Target Reps</p>
                          <input type="text" placeholder="8-10" value={newReps} onChange={(e) => setNewReps(e.target.value)}
                            className="w-full bg-background border-2 border-border p-2 font-mono text-sm text-foreground focus:border-primary outline-none" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setAddingTo(null)}
                          className="px-4 py-2.5 border-2 border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleAdd(day.key)}
                          className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-tight">
                          + Add Exercise
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setAddingTo(day.key); setNewName(""); }}
                      className="w-full py-2.5 mt-1 border-2 border-dashed border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-2 transition-colors">
                      <Plus size={12} /> Add Exercise
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type DetailTab = "progress" | "program" | "history";

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTab>("progress");

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["admin-user-profile", id],
    queryFn: async () => {
      const { data, error } = await sb.from("profiles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: workoutLogs = [] } = useQuery<WorkoutLog[]>({
    queryKey: ["admin-user-workouts", id],
    queryFn: async () => {
      const { data, error } = await sb
        .from("workout_logs").select("*").eq("user_id", id)
        .order("session_date", { ascending: false }).order("exercise_name").order("set_number");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  /* FOOD LOGS — temporarily hidden
  const { data: foodLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["admin-user-food", id],
    queryFn: async () => {
      const { data, error } = await sb
        .from("food_logs").select("*").eq("user_id", id)
        .order("session_date", { ascending: false }).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });
  */
  const foodLogs: FoodLog[] = []; // temporarily hidden

  // Group history by date
  const workoutsByDate = workoutLogs.reduce<Record<string, WorkoutLog[]>>((acc, l) => {
    if (!acc[l.session_date]) acc[l.session_date] = [];
    acc[l.session_date].push(l); return acc;
  }, {});
  // const foodByDate = ... // temporarily hidden
  const foodByDate: Record<string, FoodLog[]> = {};
  const allDates = Array.from(new Set([...Object.keys(workoutsByDate)])).sort((a, b) => b.localeCompare(a));

  if (profileLoading) return <div className="p-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">Loading...</div>;
  if (!profile) return <div className="p-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">User not found</div>;

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "progress", label: "Progress" },
    { key: "program", label: "Program" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back */}
      <button onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={12} /> Back to Users
      </button>

      {/* Profile Card */}
      <div className="bg-card border-2 border-border p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
            <span className="font-bold text-xl text-primary-foreground uppercase">
              {(profile.full_name || profile.email || "?").charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">{profile.full_name || "No Name"}</h2>
            <p className="font-mono text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <span className={`shrink-0 px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${profile.role === "admin" ? "bg-primary text-primary-foreground" : "bg-iron-medium text-muted-foreground border border-border"}`}>
            {profile.role}
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Joined {format(new Date(profile.created_at), "MMMM dd, yyyy")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Workout Sets", value: workoutLogs.length, icon: Dumbbell },
          // Food stats temporarily hidden
          // { label: "Food Logs", value: foodLogs.length, icon: Utensils },
          // { label: "Total Protein", value: `${totalProtein.toFixed(0)}g`, icon: Zap },
          // { label: "Total Calories", value: Math.round(totalCalories), icon: Flame },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border-2 border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <Icon size={12} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold tracking-tighter text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-border flex gap-0">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 -mb-0.5 ${activeTab === key ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── PROGRESS TAB ── */}
      {activeTab === "progress" && id && <WorkoutProgress userId={id} />}

      {/* ── PROGRAM TAB ── */}
      {activeTab === "program" && id && <ProgramEditor userId={id} />}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {allDates.length === 0 ? (
            <p className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">No activity logged yet</p>
          ) : (
            allDates.map((date) => {
              const entries = workoutsByDate[date] ?? [];
              const dayFoods = foodByDate[date] ?? [];
              const byExercise = entries.reduce<Record<string, WorkoutLog[]>>((acc, e) => {
                if (!acc[e.exercise_name]) acc[e.exercise_name] = [];
                acc[e.exercise_name].push(e); return acc;
              }, {});
              const dayProtein = dayFoods.reduce((a, f) => a + f.total_protein, 0);
              const dayCalories = dayFoods.reduce((a, f) => a + f.total_calories, 0);

              return (
                <div key={date} className="border-2 border-border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold uppercase text-foreground">{format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}</h4>
                    {entries[0]?.day_key && (
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase">{entries[0].day_key}</span>
                    )}
                  </div>
                  {Object.entries(byExercise).length > 0 && (
                    <div className="space-y-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-border pl-2">Workout</p>
                      {Object.entries(byExercise).map(([name, sets]) => (
                        <div key={name} className="space-y-1">
                          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{name}</p>
                          <div className="flex gap-2 flex-wrap">
                            {sets.map((s) => (
                              <div key={s.id} className="px-3 py-1.5 bg-iron-medium border border-border font-mono text-xs">
                                <span className="text-foreground">{s.weight ?? "-"}kg</span>
                                <span className="text-muted-foreground mx-1">×</span>
                                <span className="text-foreground">{s.reps ?? "-"}</span>
                                <span className="text-muted-foreground mx-1">RIR</span>
                                <span className="text-primary">{s.rir ?? "-"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* FUEL SECTION — temporarily hidden
                  {dayFoods.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-3">
                      ...
                    </div>
                  )}
                  */}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
