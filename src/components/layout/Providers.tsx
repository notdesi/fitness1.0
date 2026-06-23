"use client";

import { ScheduleProvider, useSchedule } from "@/context/ScheduleContext";
import { WorkoutsProvider, useWorkouts } from "@/context/WorkoutsContext";
import { StreakProvider } from "@/context/StreakContext";
import { useEffect, type ReactNode } from "react";

import { emptyDayWorkouts, filterTodayWorkouts } from "@/data/program";

function DayWorkoutsInit() {
  const { dayWorkouts, initDayWorkoutsFromWorkouts } = useSchedule();
  const { workouts, loaded } = useWorkouts();

  useEffect(() => {
    if (loaded && dayWorkouts === null) {
      initDayWorkoutsFromWorkouts(workouts);
    }
  }, [loaded, dayWorkouts, workouts, initDayWorkoutsFromWorkouts]);

  return null;
}

function StreakBridge({ children }: { children: ReactNode }) {
  const { todayType, todayKey, dayWorkouts } = useSchedule();
  const { workouts } = useWorkouts();

  const isRestDay = todayType === "Rest";
  const todayRequiredIds = filterTodayWorkouts(
    workouts,
    todayType,
    todayKey,
    dayWorkouts ?? emptyDayWorkouts()
  ).map((w) => w.id);

  return (
    <StreakProvider todayRequiredIds={todayRequiredIds} isRestDay={isRestDay}>
      {children}
    </StreakProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ScheduleProvider>
      <WorkoutsProvider>
        <DayWorkoutsInit />
        <StreakBridge>{children}</StreakBridge>
      </WorkoutsProvider>
    </ScheduleProvider>
  );
}
