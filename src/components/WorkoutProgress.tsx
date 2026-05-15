import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { TrendingUp, Dumbbell, Trophy, Calendar } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LogEntry {
  id: string;
  session_date: string;
  exercise_name: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
}

interface SessionPoint {
  date: string;
  dateLabel: string;
  maxWeight: number;
  totalReps: number;
  sets: number;
  avgReps: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border-2 border-border px-3 py-2 font-mono text-xs space-y-1">
      <p className="text-muted-foreground uppercase tracking-widest text-[10px]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
          {p.name === "Weight" ? " kg" : p.name === "Volume" ? " reps" : ""}
        </p>
      ))}
    </div>
  );
};

interface Props {
  userId?: string;
}

export default function WorkoutProgress({ userId }: Props = {}) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["workout-logs-progress", userId ?? "self"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("workout_logs")
        .select("id, session_date, exercise_name, set_number, weight, reps")
        .order("session_date", { ascending: true });
      if (userId) query = query.eq("user_id", userId);
      const { data, error } = await query;
      if (error) throw error;
      return data as LogEntry[];
    },
  });

  const exercises = useMemo(() => {
    if (!logs) return [];
    const names = Array.from(new Set(logs.map((l) => l.exercise_name))).sort();
    return names;
  }, [logs]);

  const sessionData = useMemo((): SessionPoint[] => {
    if (!logs || !selectedExercise) return [];
    const filtered = logs.filter((l) => l.exercise_name === selectedExercise);

    const byDate: Record<string, LogEntry[]> = {};
    for (const log of filtered) {
      if (!byDate[log.session_date]) byDate[log.session_date] = [];
      byDate[log.session_date].push(log);
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entries]) => {
        const weights = entries.map((e) => e.weight ?? 0).filter((w) => w > 0);
        const reps = entries.map((e) => e.reps ?? 0);
        const maxWeight = weights.length ? Math.max(...weights) : 0;
        const totalReps = reps.reduce((a, b) => a + b, 0);
        const avgReps = reps.length ? Math.round(totalReps / reps.length) : 0;
        return {
          date,
          dateLabel: format(parseISO(date), "MMM d"),
          maxWeight,
          totalReps,
          sets: entries.length,
          avgReps,
        };
      });
  }, [logs, selectedExercise]);

  const stats = useMemo(() => {
    if (!sessionData.length) return null;
    const pr = Math.max(...sessionData.map((s) => s.maxWeight));
    const prReps = sessionData.find((s) => s.maxWeight === pr)?.avgReps ?? 0;
    const last = sessionData[sessionData.length - 1];
    return {
      totalSessions: sessionData.length,
      pr,
      prReps,
      lastDate: last.dateLabel,
      lastWeight: last.maxWeight,
    };
  }, [sessionData]);

  if (isLoading) {
    return (
      <div className="p-6 text-center font-mono text-muted-foreground uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="p-6 text-center space-y-2">
        <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm">
          No workouts logged yet
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Log a session to track your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4">
      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground border-l-4 border-primary pl-4">
        Workout Progress
      </h2>

      {/* Exercise Selector */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Select Exercise
        </p>
        <div className="flex flex-wrap gap-2">
          {exercises.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedExercise(name === selectedExercise ? null : name)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                selectedExercise === name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {selectedExercise && sessionData.length === 0 && (
        <div className="p-6 text-center font-mono text-muted-foreground text-xs uppercase tracking-widest">
          No data for this exercise
        </div>
      )}

      {selectedExercise && sessionData.length > 0 && (
        <div className="space-y-5">
          {/* Stats Row */}
          {stats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="border-2 border-border bg-card p-3 text-center space-y-1">
                <Calendar size={14} className="mx-auto text-muted-foreground" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Sessions
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
              </div>
              <div className="border-2 border-primary bg-card p-3 text-center space-y-1">
                <Trophy size={14} className="mx-auto text-primary" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  PR
                </p>
                <p className="text-2xl font-bold text-primary">{stats.pr}kg</p>
              </div>
              <div className="border-2 border-border bg-card p-3 text-center space-y-1">
                <TrendingUp size={14} className="mx-auto text-muted-foreground" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Last
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.lastWeight}kg</p>
                <p className="font-mono text-[9px] text-muted-foreground">{stats.lastDate}</p>
              </div>
            </div>
          )}

          {/* Weight Progress Chart */}
          <div className="border-2 border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Dumbbell size={12} className="text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Weight Progress (kg)
              </p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={sessionData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  name="Weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume (Reps) Chart */}
          <div className="border-2 border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-muted-foreground" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Volume — Total Reps per Session
              </p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sessionData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalReps"
                  name="Volume"
                  fill="hsl(var(--muted-foreground))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-session table */}
          <div className="border-2 border-border bg-card overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-iron-medium">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Session Log
              </p>
            </div>
            <div className="divide-y divide-border">
              {[...sessionData].reverse().map((s) => (
                <div
                  key={s.date}
                  className="flex items-center justify-between px-4 py-2.5 font-mono text-xs"
                >
                  <span className="text-muted-foreground">{s.dateLabel}</span>
                  <div className="flex gap-4">
                    <span>
                      <span className="text-primary font-bold">{s.maxWeight}</span>
                      <span className="text-muted-foreground">kg</span>
                    </span>
                    <span>
                      <span className="text-foreground font-bold">{s.totalReps}</span>
                      <span className="text-muted-foreground"> reps</span>
                    </span>
                    <span>
                      <span className="text-foreground font-bold">{s.sets}</span>
                      <span className="text-muted-foreground"> sets</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
