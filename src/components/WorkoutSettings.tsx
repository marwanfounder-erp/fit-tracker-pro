import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { WorkoutDay, Exercise } from "@/data/workoutProgram";

interface Props {
  open: boolean;
  onClose: () => void;
  program: WorkoutDay[];
  onAddExercise: (dayKey: string, exercise: Exercise) => void;
  onRemoveExercise: (dayKey: string, exerciseName: string) => void;
  onReset: () => void;
}

export default function WorkoutSettings({
  open,
  onClose,
  program,
  onAddExercise,
  onRemoveExercise,
  onReset,
}: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSets, setNewSets] = useState("2");
  const [newReps, setNewReps] = useState("10");

  const handleAdd = (dayKey: string) => {
    if (!newName.trim()) {
      toast.error("Enter an exercise name");
      return;
    }
    onAddExercise(dayKey, {
      name: newName.trim(),
      sets: parseInt(newSets) || 2,
      targetReps: newReps.trim() || "10",
      coachingNotes: "",
      youtubeSearch: newName.trim().replace(/\s+/g, "+") + "+proper+form",
    });
    setNewName("");
    setNewSets("2");
    setNewReps("10");
    setAddingTo(null);
    toast.success("Exercise added");
  };

  const handleReset = () => {
    onReset();
    toast.success("Reset to default program");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-card border-t-2 border-border max-h-[88vh] overflow-y-auto p-0 rounded-none"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-4 border-b-2 border-border sticky top-0 bg-card z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Iron Protocol
              </p>
              <SheetTitle className="text-xl font-bold uppercase tracking-tight text-foreground">
                Workout Program
              </SheetTitle>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border font-mono text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          </div>
        </SheetHeader>

        {/* Days list */}
        <div className="divide-y divide-border">
          {program.map((day) => {
            const isExpanded = expandedDay === day.key;
            const isWorkout = day.type === "workout";

            return (
              <div key={day.key}>
                <button
                  onClick={() => isWorkout && setExpandedDay(isExpanded ? null : day.key)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left ${
                    isWorkout ? "hover:bg-iron-medium/50 transition-colors" : "cursor-default"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 ${
                        isWorkout
                          ? "bg-primary text-primary-foreground"
                          : "bg-border text-muted-foreground"
                      }`}
                    >
                      {day.label}
                    </span>
                    <div>
                      <p className="font-bold uppercase tracking-tight text-foreground text-sm">
                        {day.title}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {isWorkout
                          ? `${day.exercises.length} exercise${day.exercises.length !== 1 ? "s" : ""}`
                          : day.type === "rest"
                          ? "Rest · Stretch · Recover"
                          : "Cardio Day"}
                      </p>
                    </div>
                  </div>
                  {isWorkout &&
                    (isExpanded ? (
                      <ChevronUp size={16} className="text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                    ))}
                </button>

                {/* Expanded exercises */}
                {isExpanded && (
                  <div className="bg-iron-medium/20 px-4 pb-4 space-y-1.5">
                    {day.exercises.length === 0 && (
                      <p className="font-mono text-xs text-muted-foreground py-2 text-center">
                        No exercises — add one below
                      </p>
                    )}

                    {day.exercises.map((ex, i) => (
                      <div
                        key={ex.name}
                        className="flex items-center gap-3 px-3 py-2.5 bg-card border border-border"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground w-4 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs uppercase tracking-tight text-foreground truncate">
                            {ex.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {ex.sets} sets · {ex.targetReps} reps
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveExercise(day.key, ex.name)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1 shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Add exercise */}
                    {addingTo === day.key ? (
                      <div className="border-2 border-primary bg-card p-3 space-y-3 mt-2">
                        <input
                          type="text"
                          placeholder="Exercise name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAdd(day.key)}
                          autoFocus
                          className="w-full bg-background border-2 border-border p-2 font-mono text-sm text-foreground focus:border-primary outline-none placeholder:text-muted-foreground"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              Sets
                            </p>
                            <input
                              type="number"
                              value={newSets}
                              onChange={(e) => setNewSets(e.target.value)}
                              className="w-full bg-background border-2 border-border p-2 font-mono text-sm text-foreground focus:border-primary outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              Target Reps
                            </p>
                            <input
                              type="text"
                              placeholder="8-10"
                              value={newReps}
                              onChange={(e) => setNewReps(e.target.value)}
                              className="w-full bg-background border-2 border-border p-2 font-mono text-sm text-foreground focus:border-primary outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAddingTo(null)}
                            className="px-4 py-2.5 border-2 border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAdd(day.key)}
                            className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold text-xs uppercase tracking-tight"
                          >
                            + Add Exercise
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAddingTo(day.key);
                          setNewName("");
                        }}
                        className="w-full py-2.5 mt-1 border-2 border-dashed border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus size={12} />
                        Add Exercise
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
