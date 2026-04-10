import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Exercise } from "@/data/workoutProgram";

interface SetLog {
  weight: string;
  reps: string;
  rir: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  savedSets: SetLog[];
  onSave: (sets: SetLog[]) => void;
}

export default function ExerciseCard({ exercise, index, savedSets, onSave }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sets, setSets] = useState<SetLog[]>(() => {
    if (savedSets.length > 0) return savedSets;
    return Array.from({ length: exercise.sets }, () => ({ weight: "", reps: "", rir: "" }));
  });

  const handleChange = (setIdx: number, field: keyof SetLog, value: string) => {
    const updated = sets.map((s, i) => (i === setIdx ? { ...s, [field]: value } : s));
    setSets(updated);
    onSave(updated);
  };

  const youtubeUrl = `https://www.youtube.com/results?search_query=${exercise.youtubeSearch}`;
  const hasData = sets.some((s) => s.weight || s.rir);

  return (
    <div
      className={`border-2 transition-all ${
        expanded ? "border-primary bg-iron-medium" : "border-border bg-card"
      } ${hasData && !expanded ? "border-l-primary" : ""}`}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex justify-between items-start text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-bold uppercase tracking-tight text-foreground">
              {exercise.name}
            </h3>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {exercise.sets} Sets · {exercise.targetReps} Reps
          </p>
        </div>
        {hasData && (
          <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono text-[10px] font-bold uppercase">
            Logged
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Coaching notes */}
          <p className="font-mono text-xs text-muted-foreground border-l-2 border-primary pl-3">
            {exercise.coachingNotes}
          </p>

          {/* YouTube button */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <ExternalLink size={12} />
            Watch Form Guide
          </a>

          {/* Set inputs */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-1">
              <div className="col-span-1">Set</div>
              <div className="col-span-4">Weight (kg)</div>
              <div className="col-span-3 text-center">Reps</div>
              <div className="col-span-4 text-center">RIR</div>
            </div>

            {sets.map((set, si) => (
              <div key={si} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 font-mono text-sm italic text-muted-foreground">
                  {String(si + 1).padStart(2, "0")}
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    placeholder="0"
                    value={set.weight}
                    onChange={(e) => handleChange(si, "weight", e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-lg text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder={exercise.targetReps.split("-")[0]}
                    value={set.reps}
                    onChange={(e) => handleChange(si, "reps", e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-lg text-center text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    placeholder="2"
                    value={set.rir}
                    onChange={(e) => handleChange(si, "rir", e.target.value)}
                    className="w-full bg-background border-2 border-border p-2 font-mono text-lg text-center text-foreground focus:border-primary outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
