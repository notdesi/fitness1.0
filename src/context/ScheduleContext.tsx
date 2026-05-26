"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const JS_DAY_MAP = [6, 0, 1, 2, 3, 4, 5] as const; // JS getDay() 0=Sun → index

export type DayKey = (typeof DAYS_SHORT)[number];
export type WorkoutType = "Push" | "Pull" | "Legs" | "Rest";
export type Schedule = Record<DayKey, WorkoutType>;

const DEFAULT_SCHEDULE: Schedule = {
  Mon: "Push",
  Tue: "Pull",
  Wed: "Legs",
  Thu: "Push",
  Fri: "Pull",
  Sat: "Legs",
  Sun: "Rest",
};

interface ScheduleContextValue {
  schedule: Schedule;
  setDaySchedule: (day: DayKey, value: WorkoutType) => void;
  todayType: WorkoutType;
}

const STORAGE_KEY = "fitness-schedule";

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSchedule(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  }, [schedule, loaded]);

  function setDaySchedule(day: DayKey, value: WorkoutType) {
    setSchedule((prev) => ({ ...prev, [day]: value }));
  }

  const todayIndex = JS_DAY_MAP[new Date().getDay()];
  const todayType = schedule[DAYS_SHORT[todayIndex]];

  return (
    <ScheduleContext.Provider value={{ schedule, setDaySchedule, todayType }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
