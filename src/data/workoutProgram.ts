export interface Exercise {
  name: string;
  sets: number;
  targetReps: string;
  coachingNotes: string;
  youtubeSearch: string;
}

export interface WorkoutDay {
  key: string;
  label: string;
  title: string;
  type: "workout" | "rest" | "cardio";
  exercises: Exercise[];
}

export const workoutProgram: WorkoutDay[] = [
  {
    key: "monday",
    label: "MON",
    title: "LOWER 1",
    type: "workout",
    exercises: [
      { name: "Hack Squat", sets: 3, targetReps: "8-12", coachingNotes: "Don't lock out knees.", youtubeSearch: "hack+squat+machine+proper+form" },
      { name: "Leg Press", sets: 3, targetReps: "8-12", coachingNotes: "1 sec squeeze at top.", youtubeSearch: "leg+press+machine+proper+form" },
      { name: "Calf Raises", sets: 3, targetReps: "8-12", coachingNotes: "Control the stretch.", youtubeSearch: "calf+raises+proper+form" },
      { name: "Reverse Curl Hamstring", sets: 3, targetReps: "15", coachingNotes: "Control the stretch.", youtubeSearch: "lying+leg+curl+proper+form" },
    ],
  },
  {
    key: "tuesday",
    label: "TUE",
    title: "UPPER 1",
    type: "workout",
    exercises: [
      { name: "Flat Bench Press", sets: 3, targetReps: "8-10", coachingNotes: "Elbows at 45°. No bouncing.", youtubeSearch: "flat+bench+press+proper+form" },
      { name: "Seated Cable Row", sets: 3, targetReps: "10-12", coachingNotes: "Squeeze shoulder blades.", youtubeSearch: "seated+cable+row+proper+form" },
      { name: "Overhead DB Press", sets: 3, targetReps: "10", coachingNotes: "Seated for back support.", youtubeSearch: "overhead+dumbbell+press+proper+form" },
      { name: "Lat Pulldown", sets: 3, targetReps: "10-12", coachingNotes: "", youtubeSearch: "lat+pulldown+proper+form" },
      { name: "Tricep Extension", sets: 3, targetReps: "8-12", coachingNotes: "", youtubeSearch: "tricep+extension+proper+form" },
      { name: "Hammer Curl", sets: 3, targetReps: "8-12", coachingNotes: "", youtubeSearch: "hammer+curl+proper+form" },
      { name: "Lateral Raises", sets: 3, targetReps: "AMRAP", coachingNotes: "", youtubeSearch: "lateral+raises+proper+form" },
    ],
  },
  {
    key: "wednesday",
    label: "WED",
    title: "ACTIVE REST",
    type: "cardio",
    exercises: [],
  },
  {
    key: "thursday",
    label: "THU",
    title: "LOWER 2",
    type: "workout",
    exercises: [
      { name: "Deadlift", sets: 3, targetReps: "8-10", coachingNotes: "", youtubeSearch: "deadlift+proper+form" },
      { name: "Leg Extension", sets: 3, targetReps: "12", coachingNotes: "", youtubeSearch: "leg+extension+machine+proper+form" },
      { name: "Reverse Curl", sets: 3, targetReps: "15", coachingNotes: "", youtubeSearch: "lying+leg+curl+proper+form" },
      { name: "Seated Calf Raises", sets: 3, targetReps: "15", coachingNotes: "Slow and controlled.", youtubeSearch: "seated+calf+raises+proper+form" },
      { name: "Ab Crunches", sets: 3, targetReps: "10", coachingNotes: "", youtubeSearch: "ab+crunches+proper+form" },
    ],
  },
  {
    key: "friday",
    label: "FRI",
    title: "UPPER 2",
    type: "workout",
    exercises: [
      { name: "Incline DB Press", sets: 3, targetReps: "10-12", coachingNotes: "35–45° incline.", youtubeSearch: "incline+dumbbell+press+proper+form" },
      { name: "Wide Row", sets: 3, targetReps: "10-12", coachingNotes: "", youtubeSearch: "wide+grip+row+proper+form" },
      { name: "Pec Deck Flys", sets: 3, targetReps: "10-12", coachingNotes: "", youtubeSearch: "pec+deck+fly+proper+form" },
      { name: "Cable Crossover", sets: 3, targetReps: "10-12", coachingNotes: "", youtubeSearch: "cable+crossover+proper+form" },
      { name: "Triceps Pushdown", sets: 3, targetReps: "10-12", coachingNotes: "", youtubeSearch: "triceps+pushdown+proper+form" },
      { name: "Bicep Curls", sets: 3, targetReps: "10-12", coachingNotes: "", youtubeSearch: "bicep+curls+proper+form" },
    ],
  },
  {
    key: "saturday",
    label: "SAT",
    title: "CARDIO",
    type: "cardio",
    exercises: [],
  },
  {
    key: "sunday",
    label: "SUN",
    title: "REST DAY",
    type: "rest",
    exercises: [],
  },
];
