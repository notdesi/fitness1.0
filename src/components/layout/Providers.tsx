"use client";

import { ScheduleProvider, useSchedule } from "@/context/ScheduleContext";
import { WorkoutsProvider, useWorkouts } from "@/context/WorkoutsContext";
import { StreakProvider } from "@/context/StreakContext";
import type { ReactNode } from "react";

import { filterTodayWorkouts } from "@/data/program";

function StreakBridge({ children }: { children: ReactNode }) {
  const { todayType, todayProgramDay } = useSchedule();
  const { workouts } = useWorkouts();

  const isRestDay = todayType === "Rest";
  const todayRequiredIds = filterTodayWorkouts(
    workouts,
    todayType,
    todayProgramDay
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
        <StreakBridge>{children}</StreakBridge>
      </WorkoutsProvider>
    </ScheduleProvider>
  );
}
