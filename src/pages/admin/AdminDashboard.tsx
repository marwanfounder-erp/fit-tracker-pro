import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Dumbbell, Activity } from "lucide-react";
import { format } from "date-fns";

interface RecentLog {
  id: string;
  session_date: string;
  exercise_name: string;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  user_id: string;
  profiles: { full_name: string | null; email: string } | null;
}

export default function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: userCount = 0 } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await sb.from("profiles").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: workoutCount = 0 } = useQuery({
    queryKey: ["admin-workout-count"],
    queryFn: async () => {
      const { count } = await sb.from("workout_logs").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  /* FOOD STATS — temporarily hidden
  const { data: foodCount = 0 } = useQuery({
    queryKey: ["admin-food-count"],
    queryFn: async () => {
      const { count } = await sb.from("food_logs").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });
  */

  const { data: recentWorkouts = [] } = useQuery<RecentLog[]>({
    queryKey: ["admin-recent-workouts"],
    queryFn: async () => {
      const { data } = await sb
        .from("workout_logs")
        .select("id, session_date, exercise_name, weight, reps, rir, user_id, profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, color: "text-primary" },
    { label: "Workout Sets", value: workoutCount, icon: Dumbbell, color: "text-foreground" },
    // { label: "Food Logs", value: foodCount, icon: Utensils, color: "text-foreground" }, // temporarily hidden
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
        <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border-2 border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
              <Icon size={16} className="text-muted-foreground" />
            </div>
            <p className={`text-4xl font-bold tracking-tighter ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border-2 border-border">
        <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-border">
          <Activity size={14} className="text-primary" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-foreground">Recent Workout Activity</h3>
        </div>

        {recentWorkouts.length === 0 ? (
          <p className="px-4 py-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
            No activity yet
          </p>
        ) : (
          <div className="divide-y divide-border">
            {recentWorkouts.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-foreground uppercase truncate">{log.exercise_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {log.profiles?.full_name || log.profiles?.email || "Unknown User"}
                    {" · "}
                    {format(new Date(log.session_date + "T00:00:00"), "MMM dd")}
                  </p>
                </div>
                <div className="font-mono text-xs text-muted-foreground shrink-0">
                  {log.weight != null && (
                    <span>
                      <span className="text-foreground">{log.weight}kg</span>
                      {log.reps != null && <span> × {log.reps}</span>}
                      {log.rir != null && <span className="text-primary"> RIR {log.rir}</span>}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
