"use client";

import { Flame } from "@phosphor-icons/react";

interface StreakPillProps {
  days: number;
}

export function StreakPill({ days }: StreakPillProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-bg-surface-elevated px-3.5 py-2">
      <Flame size={14} weight="fill" className="shrink-0 text-move-red" />
      <span className="font-label leading-none text-text-primary">
        {days} {days === 1 ? "Day" : "Days"}
      </span>
    </div>
  );
}
