"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  DEFAULT_PROGRAM_SCHEDULE,
  PROGRAM_DAY_BY_WEEKDAY,
  PROGRAM_SEED_KEY,
  PROGRAM_SEED_VERSION,
  type ProgramDay,
} from "@/data/program";

export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const JS_DAY_MAP = [6, 0, 1, 2, 3, 4, 5] as const; // JS getDay() 0=Sun → index

export type DayKey = (typeof DAYS_SHORT)[number];
export type WorkoutType = "Upper" | "Lower" | "Rest";
export type Schedule = Record<DayKey, WorkoutType>;

const DEFAULT_SCHEDULE: Schedule = DEFAULT_PROGRAM_SCHEDULE;

const LEGACY_CATEGORY_MAP: Record<string, WorkoutType> = {
  Push: "Upper",
  Pull: "Upper",
  Legs: "Lower",
};

function migrateWorkoutType(value: string): WorkoutType {
  if (value === "Upper" || value === "Lower" || value === "Rest") return value;
  return LEGACY_CATEGORY_MAP[value] ?? "Upper";
}

function migrateSchedule(schedule: Record<string, string>): Schedule {
  const next = { ...DEFAULT_SCHEDULE };
  for (const day of DAYS_SHORT) {
    if (schedule[day]) next[day] = migrateWorkoutType(schedule[day]);
  }
  return next;
}

/** Rotate workout assignments one slot later among non-rest days; rest days stay Rest. */
export function rotateScheduleForSkip(schedule: Schedule): Schedule {
  const workDays = DAYS_SHORT.filter((day) => schedule[day] !== "Rest");
  if (workDays.length <= 1) return schedule;

  const workouts = workDays.map((day) => schedule[day]);
  const rotated = [workouts[workouts.length - 1], ...workouts.slice(0, -1)];

  const next = { ...schedule };
  workDays.forEach((day, i) => {
    next[day] = rotated[i];
  });
  return next;
}

/** Rotate workout assignments one slot later across ALL days; rest days can shift too. */
export function rotateScheduleForSkipUnanchored(schedule: Schedule): Schedule {
  const workouts = DAYS_SHORT.map((day) => schedule[day]);
  const rotated = [workouts[workouts.length - 1], ...workouts.slice(0, -1)];

  const next = { ...schedule };
  DAYS_SHORT.forEach((day, i) => {
    next[day] = rotated[i];
  });
  return next;
}

interface ScheduleContextValue {
  schedule: Schedule;
  setDaySchedule: (day: DayKey, value: WorkoutType) => void;
  skipToday: () => void;
  todayType: WorkoutType;
  todayProgramDay: ProgramDay | null;
  isRestDay: boolean;
  anchorRestDays: boolean;
  setAnchorRestDays: (value: boolean) => void;
}

const STORAGE_KEY = "fitness-schedule";
const ANCHOR_REST_DAYS_KEY = "fitness-anchor-rest-days";

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [loaded, setLoaded] = useState(false);
  const [anchorRestDays, setAnchorRestDays] = useState(true);

  useEffect(() => {
    const shouldSeed =
      localStorage.getItem(PROGRAM_SEED_KEY) !== String(PROGRAM_SEED_VERSION);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && !shouldSeed) {
        setSchedule(migrateSchedule(JSON.parse(stored)));
      } else if (shouldSeed) {
        setSchedule(DEFAULT_PROGRAM_SCHEDULE);
      }
    } catch {}
    try {
      const storedAnchor = localStorage.getItem(ANCHOR_REST_DAYS_KEY);
      if (storedAnchor) setAnchorRestDays(JSON.parse(storedAnchor));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(ANCHOR_REST_DAYS_KEY, JSON.stringify(anchorRestDays));
  }, [anchorRestDays, loaded]);

  function setDaySchedule(day: DayKey, value: WorkoutType) {
    setSchedule((prev) => ({ ...prev, [day]: value }));
  }

  function skipToday() {
    setSchedule((prev) => {
      const todayIndex = JS_DAY_MAP[new Date().getDay()];
      const todayKey = DAYS_SHORT[todayIndex];
      if (prev[todayKey] === "Rest") return prev;
      return anchorRestDays
        ? rotateScheduleForSkip(prev)
        : rotateScheduleForSkipUnanchored(prev);
    });
  }

  const todayIndex = JS_DAY_MAP[new Date().getDay()];
  const todayKey = DAYS_SHORT[todayIndex];
  const todayType = schedule[todayKey];
  const todayProgramDay = PROGRAM_DAY_BY_WEEKDAY[todayKey] ?? null;
  const isRestDay = todayType === "Rest";

  return (
    <ScheduleContext.Provider
      value={{
        schedule,
        setDaySchedule,
        skipToday,
        todayType,
        todayProgramDay,
        isRestDay,
        anchorRestDays,
        setAnchorRestDays,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
