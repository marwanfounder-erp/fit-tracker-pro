import { useState, useCallback } from "react";
import { workoutProgram as defaultProgram, type WorkoutDay, type Exercise } from "@/data/workoutProgram";

const STORAGE_KEY = "iron_workout_program";

function loadProgram(): WorkoutDay[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultProgram;
}

function saveProgram(program: WorkoutDay[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
}

export function useWorkoutProgram() {
  const [program, setProgram] = useState<WorkoutDay[]>(loadProgram);

  const addExercise = useCallback((dayKey: string, exercise: Exercise) => {
    setProgram((prev) => {
      const updated = prev.map((d) =>
        d.key === dayKey ? { ...d, exercises: [...d.exercises, exercise] } : d
      );
      saveProgram(updated);
      return updated;
    });
  }, []);

  const removeExercise = useCallback((dayKey: string, exerciseName: string) => {
    setProgram((prev) => {
      const updated = prev.map((d) =>
        d.key === dayKey
          ? { ...d, exercises: d.exercises.filter((e) => e.name !== exerciseName) }
          : d
      );
      saveProgram(updated);
      return updated;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgram(defaultProgram);
  }, []);

  return { program, addExercise, removeExercise, resetToDefault };
}
