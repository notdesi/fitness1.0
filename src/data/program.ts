import type { Schedule } from "@/context/ScheduleContext";
import type { Workout } from "@/context/WorkoutsContext";

export const PROGRAM_SEED_VERSION = 1;
export const PROGRAM_SEED_KEY = "fitness-program-seed";

export type ProgramDay = 1 | 2 | 3 | 4;

export const PROGRAM_DAY_BY_WEEKDAY: Partial<Record<keyof Schedule, ProgramDay>> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
};

export const DEFAULT_PROGRAM_SCHEDULE: Schedule = {
  Mon: "Upper",
  Tue: "Lower",
  Wed: "Upper",
  Thu: "Lower",
  Fri: "Rest",
  Sat: "Rest",
  Sun: "Rest",
};

type WorkoutSeed = Omit<Workout, "id">;

function w(
  name: string,
  category: "Upper" | "Lower",
  muscles: string[],
  programDay: ProgramDay
): WorkoutSeed {
  return { name, category, muscles, programDay, pr: 0, reps: 0, recordType: "pr" };
}

export const DEFAULT_PROGRAM_WORKOUTS: WorkoutSeed[] = [
  // Day 1 — Upper
  w("Bench or DB press", "Upper", ["Chest"], 1),
  w("Barbell row", "Upper", ["Back"], 1),
  w("Overhead press", "Upper", ["Shoulders"], 1),
  w("Lat pulldown", "Upper", ["Back"], 1),
  w("Incline DB press", "Upper", ["Chest"], 1),
  w("Biceps curl", "Upper", ["Biceps"], 1),
  w("Triceps pushdown", "Upper", ["Triceps"], 1),

  // Day 2 — Lower
  w("Squat", "Lower", ["Quads"], 2),
  w("45° back extension", "Lower", ["Hamstrings", "Glutes"], 2),
  w("Leg press", "Lower", ["Quads"], 2),
  w("Leg curl", "Lower", ["Hamstrings"], 2),
  w("Calf raise", "Lower", ["Calves"], 2),

  // Day 3 — Upper
  w("Pull-up / lat pulldown", "Upper", ["Back"], 3),
  w("Incline press", "Upper", ["Chest"], 3),
  w("Seated cable row", "Upper", ["Back"], 3),
  w("Lateral raise", "Upper", ["Shoulders"], 3),
  w("Dips or chest fly", "Upper", ["Chest", "Triceps"], 3),
  w("Face pull", "Upper", ["Shoulders"], 3),
  w("Hammer curl + OH triceps ext", "Upper", ["Biceps", "Triceps"], 3),

  // Day 4 — Lower
  w("Bulgarian split squat", "Lower", ["Quads"], 4),
  w("GHR / Nordic / pull-through", "Lower", ["Hamstrings", "Glutes"], 4),
  w("Walking lunge", "Lower", ["Quads"], 4),
  w("Seated leg curl", "Lower", ["Hamstrings"], 4),
  w("Leg extension", "Lower", ["Quads"], 4),
  w("Seated calf raise", "Lower", ["Calves"], 4),
];

export function matchesProgramDay(
  workout: Pick<Workout, "programDay">,
  programDay: ProgramDay | null
): boolean {
  if (workout.programDay == null) return true;
  return programDay === workout.programDay;
}

export function filterTodayWorkouts(
  workouts: Workout[],
  todayType: string,
  programDay: ProgramDay | null
): Workout[] {
  if (todayType === "Rest") return [];
  return workouts.filter(
    (w) => w.category === todayType && matchesProgramDay(w, programDay)
  );
}
