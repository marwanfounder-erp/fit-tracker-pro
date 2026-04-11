import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft, Dumbbell, Utensils, Zap, Flame } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface WorkoutLog {
  id: string;
  session_date: string;
  day_key: string;
  exercise_name: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
}

interface FoodLog {
  id: string;
  session_date: string;
  food_name: string;
  emoji: string;
  quantity: number;
  unit: string;
  total_protein: number;
  total_calories: number;
}

const unitLabel = (unit: string) =>
  ({ g: "g", piece: "pcs", scoop: "scoops", slice: "slices" }[unit] ?? unit);

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

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
        .from("workout_logs")
        .select("*")
        .eq("user_id", id)
        .order("session_date", { ascending: false })
        .order("exercise_name")
        .order("set_number");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: foodLogs = [] } = useQuery<FoodLog[]>({
    queryKey: ["admin-user-food", id],
    queryFn: async () => {
      const { data, error } = await sb
        .from("food_logs")
        .select("*")
        .eq("user_id", id)
        .order("session_date", { ascending: false })
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  // Aggregate stats
  const totalProtein = foodLogs.reduce((acc, f) => acc + f.total_protein, 0);
  const totalCalories = foodLogs.reduce((acc, f) => acc + f.total_calories, 0);

  // Group workouts by date
  const workoutsByDate = workoutLogs.reduce<Record<string, WorkoutLog[]>>((acc, log) => {
    if (!acc[log.session_date]) acc[log.session_date] = [];
    acc[log.session_date].push(log);
    return acc;
  }, {});

  // Group food by date
  const foodByDate = foodLogs.reduce<Record<string, FoodLog[]>>((acc, f) => {
    if (!acc[f.session_date]) acc[f.session_date] = [];
    acc[f.session_date].push(f);
    return acc;
  }, {});

  const allDates = Array.from(
    new Set([...Object.keys(workoutsByDate), ...Object.keys(foodByDate)])
  ).sort((a, b) => b.localeCompare(a));

  if (profileLoading) {
    return (
      <div className="p-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={12} />
        Back to Users
      </button>

      {/* Profile Card */}
      <div className="bg-card border-2 border-border p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
            <span className="font-bold text-xl text-primary-foreground uppercase">
              {(profile.full_name || profile.email || "?").charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
              {profile.full_name || "No Name"}
            </h2>
            <p className="font-mono text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <span className={`shrink-0 px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
            profile.role === "admin"
              ? "bg-primary text-primary-foreground"
              : "bg-iron-medium text-muted-foreground border border-border"
          }`}>
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
          { label: "Food Logs", value: foodLogs.length, icon: Utensils },
          { label: "Total Protein", value: `${totalProtein.toFixed(0)}g`, icon: Zap },
          { label: "Total Calories", value: `${Math.round(totalCalories)}`, icon: Flame },
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

      {/* Daily History */}
      {allDates.length === 0 ? (
        <div className="py-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          No activity logged yet
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-tight text-foreground border-l-4 border-primary pl-4">
            Activity History
          </h3>

          {allDates.map((date) => {
            const entries = workoutsByDate[date] ?? [];
            const dayFoods = foodByDate[date] ?? [];
            const byExercise = entries.reduce<Record<string, WorkoutLog[]>>((acc, e) => {
              if (!acc[e.exercise_name]) acc[e.exercise_name] = [];
              acc[e.exercise_name].push(e);
              return acc;
            }, {});
            const dayProtein = dayFoods.reduce((acc, f) => acc + f.total_protein, 0);
            const dayCalories = dayFoods.reduce((acc, f) => acc + f.total_calories, 0);

            return (
              <div key={date} className="border-2 border-border bg-card p-4 space-y-4">
                {/* Date Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase text-foreground">
                    {format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}
                  </h4>
                  {entries[0]?.day_key && (
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono text-[10px] uppercase">
                      {entries[0].day_key}
                    </span>
                  )}
                </div>

                {/* Workout */}
                {Object.entries(byExercise).length > 0 && (
                  <div className="space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-border pl-2">
                      Workout
                    </p>
                    {Object.entries(byExercise).map(([exerciseName, sets]) => (
                      <div key={exerciseName} className="space-y-1">
                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                          {exerciseName}
                        </p>
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

                {/* Food */}
                {dayFoods.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-primary pl-2">
                        Fuel
                      </p>
                      <div className="flex gap-3 font-mono text-[10px]">
                        <span>
                          <span className="text-primary font-bold">{dayProtein.toFixed(1)}g</span>
                          <span className="text-muted-foreground"> prot</span>
                        </span>
                        <span>
                          <span className="text-foreground font-bold">{Math.round(dayCalories)}</span>
                          <span className="text-muted-foreground"> kcal</span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {dayFoods.map((item) => (
                        <div key={item.id} className="flex items-center gap-2.5 px-3 py-2 bg-iron-medium border border-border">
                          <span className="text-sm leading-none">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs uppercase tracking-tight text-foreground truncate">
                              {item.food_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                            <span className="text-muted-foreground">{item.quantity}{unitLabel(item.unit)}</span>
                            <span className="text-primary">{item.total_protein.toFixed(1)}g</span>
                            <span className="text-muted-foreground">{Math.round(item.total_calories)}kcal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
