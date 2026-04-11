import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  session_date: string;
  day_key: string;
  exercise_name: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
}

interface FoodLogEntry {
  id: string;
  session_date: string;
  food_name: string;
  emoji: string;
  quantity: number;
  unit: string;
  total_protein: number;
  total_calories: number;
}

type DateFilter = "all" | "week" | "month";

interface Props {
  dateFilter: DateFilter;
}

const unitLabel = (unit: string) =>
  ({ g: "g", piece: "pcs", scoop: "scoops", slice: "slices" }[unit] ?? unit);

export default function OverviewPage({ dateFilter }: Props) {
  const queryClient = useQueryClient();

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["workout-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .order("session_date", { ascending: false })
        .order("exercise_name")
        .order("set_number");
      if (error) throw error;
      return data as LogEntry[];
    },
  });

  const { data: foodLogs, isLoading: foodLoading } = useQuery({
    queryKey: ["food-logs-history"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("food_logs")
        .select("*")
        .order("session_date", { ascending: false })
        .order("created_at");
      if (error) throw error;
      return data as FoodLogEntry[];
    },
  });

  const handleDeleteSession = async (date: string) => {
    const { error: w } = await supabase
      .from("workout_logs")
      .delete()
      .eq("session_date", date);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: f } = await (supabase as any)
      .from("food_logs")
      .delete()
      .eq("session_date", date);

    if (w || f) {
      toast.error("Failed to delete session");
    } else {
      toast.success("Session deleted");
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["food-logs-history"] });
    }
  };

  if (logsLoading || foodLoading) {
    return (
      <div className="p-6 text-center font-mono text-muted-foreground uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  // Group workout logs by date
  const grouped = (logs ?? []).reduce<Record<string, LogEntry[]>>((acc, log) => {
    if (!acc[log.session_date]) acc[log.session_date] = [];
    acc[log.session_date].push(log);
    return acc;
  }, {});

  // Group food logs by date
  const foodByDate = (foodLogs ?? []).reduce<Record<string, FoodLogEntry[]>>((acc, f) => {
    if (!acc[f.session_date]) acc[f.session_date] = [];
    acc[f.session_date].push(f);
    return acc;
  }, {});

  // All unique dates, sorted descending, filtered by dateFilter
  const allDates = Array.from(
    new Set([...Object.keys(grouped), ...Object.keys(foodByDate)])
  )
    .sort((a, b) => b.localeCompare(a))
    .filter((date) => {
      if (dateFilter === "all") return true;
      const diffDays =
        (new Date().getTime() - new Date(date + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24);
      return dateFilter === "week" ? diffDays <= 7 : diffDays <= 30;
    });

  if (allDates.length === 0) {
    return (
      <div className="p-6 text-center space-y-2">
        <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm">
          No sessions logged yet
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Complete a workout or log food to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground border-l-4 border-primary pl-4">
        Daily History
      </h2>

      {allDates.map((date) => {
        const entries = grouped[date] ?? [];
        const dayFoods = foodByDate[date] ?? [];

        const byExercise = entries.reduce<Record<string, LogEntry[]>>((acc, e) => {
          if (!acc[e.exercise_name]) acc[e.exercise_name] = [];
          acc[e.exercise_name].push(e);
          return acc;
        }, {});

        const dayKey = entries[0]?.day_key || "";
        const totalProtein = dayFoods.reduce((acc, f) => acc + f.total_protein, 0);
        const totalCalories = dayFoods.reduce((acc, f) => acc + f.total_calories, 0);

        return (
          <div key={date} className="border-2 border-border bg-card p-4 space-y-4">
            {/* Date Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold uppercase text-foreground">
                {format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}
              </h3>
              <div className="flex items-center gap-2">
                {dayKey && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase">
                    {dayKey}
                  </span>
                )}
                <button
                  onClick={() => handleDeleteSession(date)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Delete session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Workout Exercises */}
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
                        <div
                          key={s.id}
                          className="px-3 py-1.5 bg-iron-medium border border-border font-mono text-xs"
                        >
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

            {/* Food Logs */}
            {dayFoods.length > 0 && (
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-primary pl-2">
                    Fuel
                  </p>
                  <div className="flex gap-3 font-mono text-[10px]">
                    <span>
                      <span className="text-primary font-bold">{totalProtein.toFixed(1)}g</span>
                      <span className="text-muted-foreground"> prot</span>
                    </span>
                    <span>
                      <span className="text-foreground font-bold">{Math.round(totalCalories)}</span>
                      <span className="text-muted-foreground"> kcal</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {dayFoods.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 px-3 py-2 bg-iron-medium border border-border"
                    >
                      <span className="text-sm leading-none">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs uppercase tracking-tight text-foreground truncate">
                          {item.food_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
                        <span className="text-muted-foreground">
                          {item.quantity}
                          {unitLabel(item.unit)}
                        </span>
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
  );
}
