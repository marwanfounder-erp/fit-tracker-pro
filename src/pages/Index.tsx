import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutProgram } from "@/hooks/useWorkoutProgram";
import DaySelector from "@/components/DaySelector";
import ExerciseCard from "@/components/ExerciseCard";
import BottomNav from "@/components/BottomNav";
import OverviewPage from "@/components/OverviewPage";
import FoodLog from "@/components/FoodLog";
import WorkoutSettings from "@/components/WorkoutSettings";
import { Footprints, StretchHorizontal } from "lucide-react";
import type { WorkoutDay } from "@/data/workoutProgram";

type SetLog = { weight: string; reps: string; rir: string };
type DateFilter = "all" | "week" | "month";

function getTodayDayKey(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date().getDay()];
}

export default function Index() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { program, addExercise, removeExercise, resetToDefault } = useWorkoutProgram();

  const todayKey = getTodayDayKey();
  const todayDay = program.find((d) => d.key === todayKey) || program[0];

  const [selectedDay, setSelectedDay] = useState<WorkoutDay>(todayDay);
  const [tab, setTab] = useState<"log" | "overview">("log");
  const [logTab, setLogTab] = useState<"workout" | "food">("workout");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const [saving, setSaving] = useState(false);

  // Keep selectedDay in sync if program changes
  const handleSelectDay = useCallback(
    (day: WorkoutDay) => {
      const fresh = program.find((d) => d.key === day.key) ?? day;
      setSelectedDay(fresh);
    },
    [program]
  );

  const handleSetSave = useCallback((exerciseName: string, sets: SetLog[]) => {
    setExerciseLogs((prev) => ({ ...prev, [exerciseName]: sets }));
  }, []);

  const handleSaveSession = async () => {
    const entries = Object.entries(exerciseLogs).filter(([, sets]) =>
      sets.some((s) => s.weight || s.rir)
    );

    if (entries.length === 0) {
      toast.error("No data to save. Enter some weights first!");
      return;
    }

    setSaving(true);
    const today = new Date().toISOString().split("T")[0];

    const rows = entries.flatMap(([exerciseName, sets]) =>
      sets
        .filter((s) => s.weight || s.rir)
        .map((s, i) => ({
          session_date: today,
          day_key: selectedDay.key,
          exercise_name: exerciseName,
          set_number: i + 1,
          weight: s.weight ? parseFloat(s.weight) : null,
          reps: s.reps ? parseInt(s.reps) : null,
          rir: s.rir ? parseInt(s.rir) : null,
          user_id: user?.id ?? null,
        }))
    );

    const { error } = await supabase.from("workout_logs").insert(rows);

    if (error) {
      toast.error("Failed to save session");
      console.error(error);
    } else {
      toast.success("Session locked! 💪");
      setExerciseLogs({});
    }
    setSaving(false);
  };

  // When program updates, refresh selectedDay with latest exercises
  const currentDay = program.find((d) => d.key === selectedDay.key) ?? selectedDay;

  return (
    <div className="min-h-dvh bg-background max-w-xl mx-auto border-x border-border">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b-2 border-border px-4 py-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Iron Protocol
            </p>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic text-foreground">
              Grindstone Log
            </h1>
          </div>
          <div className="flex items-end gap-3">
            {tab === "log" && (
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {currentDay.title}
                </p>
                <p className="text-lg font-bold uppercase italic text-foreground">
                  {currentDay.label}
                </p>
              </div>
            )}
            <button
              onClick={async () => { await signOut(); navigate("/login"); }}
              className="pb-0.5 text-muted-foreground hover:text-primary transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Log tab: DaySelector + WORKOUT/FUEL sub-tabs */}
        {tab === "log" ? (
          <>
            <DaySelector selectedDay={currentDay} onSelect={handleSelectDay} />
            <div className="grid grid-cols-2 mt-3 border-t border-border">
              <button
                onClick={() => setLogTab("workout")}
                className={`py-2.5 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
                  logTab === "workout"
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                Workout
              </button>
              <button
                onClick={() => setLogTab("food")}
                className={`py-2.5 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 ${
                  logTab === "food"
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                Fuel
              </button>
            </div>
          </>
        ) : (
          /* Overview tab: date filter pills */
          <div className="flex gap-1.5 pt-1">
            {(["all", "week", "month"] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                  dateFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All Time" : f === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="pb-24 pt-4">
        {tab === "log" ? (
          logTab === "workout" ? (
            <div className="space-y-6">
              {currentDay.type === "workout" ? (
                <>
                  <div className="px-4">
                    <div className="flex items-baseline justify-between border-l-4 border-primary pl-4">
                      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                        {currentDay.title}
                      </h2>
                      <span className="font-mono text-xs text-muted-foreground">
                        {currentDay.exercises.length} Exercises
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 px-4">
                    {currentDay.exercises.map((exercise, i) => (
                      <ExerciseCard
                        key={exercise.name}
                        exercise={exercise}
                        index={i}
                        savedSets={exerciseLogs[exercise.name] || []}
                        onSave={(sets) => handleSetSave(exercise.name, sets)}
                      />
                    ))}
                  </div>

                  <div className="px-4">
                    <button
                      onClick={handleSaveSession}
                      disabled={saving}
                      className="w-full bg-primary text-primary-foreground font-bold text-xl uppercase py-4 italic tracking-tighter flex justify-between px-6 items-center border-b-4 border-background hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <span>{saving ? "Saving..." : "Lock Session"}</span>
                      <span className="font-mono">→</span>
                    </button>
                  </div>
                </>
              ) : currentDay.type === "rest" ? (
                <div className="px-4 py-12 text-center space-y-4">
                  <StretchHorizontal size={48} className="mx-auto text-muted-foreground" />
                  <h2 className="text-2xl font-bold uppercase italic text-foreground">Rest Day</h2>
                  <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                    Walk · Stretch · Recover
                  </p>
                </div>
              ) : (
                <div className="px-4 py-12 text-center space-y-4">
                  <Footprints size={48} className="mx-auto text-primary" />
                  <h2 className="text-2xl font-bold uppercase italic text-foreground">Cardio Day</h2>
                  <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                    Go for a run 🏃
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 pt-2">
              <FoodLog />
            </div>
          )
        ) : (
          <OverviewPage dateFilter={dateFilter} />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      {/* Workout Settings Sheet */}
      <WorkoutSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        program={program}
        onAddExercise={addExercise}
        onRemoveExercise={removeExercise}
        onReset={resetToDefault}
      />
    </div>
  );
}
