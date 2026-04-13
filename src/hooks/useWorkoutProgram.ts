import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { workoutProgram as defaultProgram, type WorkoutDay, type Exercise } from "@/data/workoutProgram";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

async function fetchProgram(userId: string): Promise<WorkoutDay[]> {
  const { data, error } = await sb
    .from("user_programs")
    .select("*")
    .eq("user_id", userId)
    .order("id");

  if (error || !data || data.length === 0) return defaultProgram;

  // Merge DB rows over the default structure to preserve order & non-workout days
  const byKey: Record<string, WorkoutDay> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((row: any) => {
    byKey[row.day_key] = {
      key: row.day_key,
      label: row.label,
      title: row.title,
      type: row.type,
      exercises: row.exercises,
    };
  });

  return defaultProgram.map((day) => byKey[day.key] ?? day);
}

async function upsertProgram(userId: string, program: WorkoutDay[]) {
  const rows = program.map((day) => ({
    user_id: userId,
    day_key: day.key,
    label: day.label,
    title: day.title,
    type: day.type,
    exercises: day.exercises,
  }));
  await sb.from("user_programs").upsert(rows, { onConflict: "user_id,day_key" });
}

export function useWorkoutProgram(targetUserId?: string) {
  const { user } = useAuth();
  const uid = targetUserId ?? user?.id;
  const queryClient = useQueryClient();

  const { data: program = defaultProgram, isLoading } = useQuery<WorkoutDay[]>({
    queryKey: ["user-program", uid],
    queryFn: () => fetchProgram(uid!),
    enabled: !!uid,
    staleTime: 30_000,
  });

  const applyUpdate = useCallback(
    async (updated: WorkoutDay[]) => {
      if (!uid) return;
      // Optimistic update — UI responds instantly, then persists to DB
      queryClient.setQueryData(["user-program", uid], updated);
      await upsertProgram(uid, updated);
    },
    [uid, queryClient]
  );

  const addExercise = useCallback(
    async (dayKey: string, exercise: Exercise) => {
      const updated = program.map((d) =>
        d.key === dayKey ? { ...d, exercises: [...d.exercises, exercise] } : d
      );
      await applyUpdate(updated);
    },
    [program, applyUpdate]
  );

  const removeExercise = useCallback(
    async (dayKey: string, exerciseName: string) => {
      const updated = program.map((d) =>
        d.key === dayKey
          ? { ...d, exercises: d.exercises.filter((e) => e.name !== exerciseName) }
          : d
      );
      await applyUpdate(updated);
    },
    [program, applyUpdate]
  );

  const resetToDefault = useCallback(async () => {
    if (!uid) return;
    await sb.from("user_programs").delete().eq("user_id", uid);
    queryClient.setQueryData(["user-program", uid], defaultProgram);
  }, [uid, queryClient]);

  return { program, isLoading, addExercise, removeExercise, resetToDefault };
}
