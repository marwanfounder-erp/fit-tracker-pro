import { workoutProgram, type WorkoutDay } from "@/data/workoutProgram";

interface DaySelectorProps {
  selectedDay: WorkoutDay;
  onSelect: (day: WorkoutDay) => void;
}

export default function DaySelector({ selectedDay, onSelect }: DaySelectorProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 px-4">
      {workoutProgram.map((day) => {
        const isActive = day.key === selectedDay.key;
        return (
          <button
            key={day.key}
            onClick={() => onSelect(day)}
            className={`flex-shrink-0 px-3 py-2 font-mono text-xs uppercase tracking-widest transition-all border-2 ${
              isActive
                ? "border-primary bg-primary text-primary-foreground font-semibold"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
