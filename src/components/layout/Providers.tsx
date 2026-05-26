"use client";

import { ScheduleProvider, useSchedule } from "@/context/ScheduleContext";
import { WorkoutsProvider, useWorkouts } from "@/context/WorkoutsContext";
import { StreakProvider } from "@/context/StreakContext";
import type { ReactNode } from "react";

function StreakBridge({ children }: { children: ReactNode }) {
  const { todayType } = useSchedule();
  const { workouts } = useWorkouts();

  const isRestDay = todayType === "Rest";
  const todayRequiredIds = isRestDay
    ? []
    : workouts.filter((w) => w.category === todayType).map((w) => w.id);

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
