"use client";

import { ScheduleProvider } from "@/context/ScheduleContext";
import { WorkoutsProvider } from "@/context/WorkoutsContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ScheduleProvider>
      <WorkoutsProvider>{children}</WorkoutsProvider>
    </ScheduleProvider>
  );
}
