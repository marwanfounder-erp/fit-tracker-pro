import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

export default function OverviewPage() {
  const { data: logs, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="p-6 text-center font-mono text-muted-foreground uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center space-y-2">
        <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm">
          No sessions logged yet
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Complete a workout to see your history here
        </p>
      </div>
    );
  }

  // Group by session_date
  const grouped = logs.reduce<Record<string, LogEntry[]>>((acc, log) => {
    const key = log.session_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  return (
    <div className="space-y-6 px-4">
      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground border-l-4 border-primary pl-4">
        Session History
      </h2>

      {Object.entries(grouped).map(([date, entries]) => {
        // Group entries by exercise
        const byExercise = entries.reduce<Record<string, LogEntry[]>>((acc, e) => {
          if (!acc[e.exercise_name]) acc[e.exercise_name] = [];
          acc[e.exercise_name].push(e);
          return acc;
        }, {});

        const dayKey = entries[0]?.day_key || "";

        return (
          <div key={date} className="border-2 border-border bg-card p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold uppercase text-foreground">
                {format(new Date(date + "T00:00:00"), "MMM dd, yyyy")}
              </h3>
              <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase">
                {dayKey}
              </span>
            </div>

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
        );
      })}
    </div>
  );
}
