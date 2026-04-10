import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { workoutProgram, type WorkoutDay } from "@/data/workoutProgram";
import DaySelector from "@/components/DaySelector";
import ExerciseCard from "@/components/ExerciseCard";
import BottomNav from "@/components/BottomNav";
import OverviewPage from "@/components/OverviewPage";
import { Footprints, StretchHorizontal } from "lucide-react";

type SetLog = { weight: string; reps: string; rir: string };

function getTodayDayKey(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date().getDay()];
}

export default function Index() {
  const todayKey = getTodayDayKey();
  const todayDay = workoutProgram.find((d) => d.key === todayKey) || workoutProgram[0];

  const [selectedDay, setSelectedDay] = useState<WorkoutDay>(todayDay);
  const [tab, setTab] = useState<"log" | "overview">("log");
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const [saving, setSaving] = useState(false);

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
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {selectedDay.title}
            </p>
            <p className="text-lg font-bold uppercase italic text-foreground">
              {selectedDay.label}
            </p>
          </div>
        </div>
        <DaySelector selectedDay={selectedDay} onSelect={setSelectedDay} />
      </header>

      {/* Content */}
      <main className="pb-24 pt-4">
        {tab === "log" ? (
          <div className="space-y-6">
            {selectedDay.type === "workout" ? (
              <>
                <div className="px-4">
                  <div className="flex items-baseline justify-between border-l-4 border-primary pl-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                      {selectedDay.title}
                    </h2>
                    <span className="font-mono text-xs text-muted-foreground">
                      {selectedDay.exercises.length} Exercises
                    </span>
                  </div>
                </div>

                <div className="space-y-3 px-4">
                  {selectedDay.exercises.map((exercise, i) => (
                    <ExerciseCard
                      key={exercise.name}
                      exercise={exercise}
                      index={i}
                      savedSets={exerciseLogs[exercise.name] || []}
                      onSave={(sets) => handleSetSave(exercise.name, sets)}
                    />
                  ))}
                </div>

                {/* Save button */}
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
            ) : selectedDay.type === "rest" ? (
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
          <OverviewPage />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
