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
    title: "UPPER 1",
    type: "workout",
    exercises: [
      { name: "Flat Bench Press", sets: 2, targetReps: "8-10", coachingNotes: "Elbows at 45°. No bouncing.", youtubeSearch: "flat+bench+press+proper+form" },
      { name: "Seated Cable Row", sets: 2, targetReps: "10-12", coachingNotes: "Squeeze shoulder blades.", youtubeSearch: "seated+cable+row+proper+form" },
      { name: "Overhead DB Press", sets: 2, targetReps: "10", coachingNotes: "Seated for back support.", youtubeSearch: "overhead+dumbbell+press+proper+form" },
      { name: "Lat Pulldown", sets: 2, targetReps: "10-12", coachingNotes: "Pull to upper chest.", youtubeSearch: "lat+pulldown+proper+form" },
      { name: "Lateral Raises", sets: 2, targetReps: "AMRAP", coachingNotes: "Control the movement.", youtubeSearch: "lateral+raises+proper+form" },
    ],
  },
  {
    key: "tuesday",
    label: "TUE",
    title: "LOWER 1",
    type: "workout",
    exercises: [
      { name: "Leg Press", sets: 2, targetReps: "10-12", coachingNotes: "Feet shoulder-width apart.", youtubeSearch: "leg+press+machine+proper+form" },
      { name: "Leg Extensions", sets: 2, targetReps: "10-12", coachingNotes: "1 sec squeeze at top.", youtubeSearch: "leg+extension+machine+proper+form" },
      { name: "Seated Leg Curl", sets: 2, targetReps: "10-12", coachingNotes: "Control the stretch.", youtubeSearch: "seated+leg+curl+proper+form" },
      { name: "Calf Raises", sets: 2, targetReps: "15", coachingNotes: "1 sec pause at bottom.", youtubeSearch: "calf+raises+proper+form" },
      { name: "Plank", sets: 2, targetReps: "30s", coachingNotes: "Keep core tight.", youtubeSearch: "plank+exercise+proper+form" },
    ],
  },
  {
    key: "wednesday",
    label: "WED",
    title: "REST DAY",
    type: "rest",
    exercises: [],
  },
  {
    key: "thursday",
    label: "THU",
    title: "UPPER 2",
    type: "workout",
    exercises: [
      { name: "Incline DB Press", sets: 2, targetReps: "10-12", coachingNotes: "30-degree incline.", youtubeSearch: "incline+dumbbell+press+proper+form" },
      { name: "Wide Row", sets: 2, targetReps: "10-12", coachingNotes: "Neutral spine, don't twist.", youtubeSearch: "wide+grip+row+proper+form" },
      { name: "Face Pulls", sets: 2, targetReps: "10-12", coachingNotes: "Pull toward forehead.", youtubeSearch: "face+pulls+proper+form" },
      { name: "Assisted Dips", sets: 2, targetReps: "10-12", coachingNotes: "Full range of motion.", youtubeSearch: "assisted+dips+proper+form" },
      { name: "Bicep Curls", sets: 2, targetReps: "10-12", coachingNotes: "Control the negative.", youtubeSearch: "bicep+curls+proper+form" },
    ],
  },
  {
    key: "friday",
    label: "FRI",
    title: "LOWER 2",
    type: "workout",
    exercises: [
      { name: "Hack Squat", sets: 2, targetReps: "12", coachingNotes: "Hold DB at chest height.", youtubeSearch: "hack+squat+machine+proper+form" },
      { name: "Hip Thrust", sets: 2, targetReps: "15", coachingNotes: "Squeeze glutes at top.", youtubeSearch: "hip+thrust+proper+form" },
      { name: "Seated Calf Raises", sets: 2, targetReps: "15", coachingNotes: "Slow and controlled.", youtubeSearch: "seated+calf+raises+proper+form" },
      { name: "Walking Lunges", sets: 2, targetReps: "10/leg", coachingNotes: "Watch knee tracking.", youtubeSearch: "walking+lunges+proper+form" },
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
