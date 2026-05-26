"use client";

import { useSchedule, type DayKey, type WorkoutType } from "@/context/ScheduleContext";

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const OPTIONS: WorkoutType[] = ["Push", "Pull", "Legs", "Rest"];

const OPTION_COLORS: Record<string, string> = {
  Push: "bg-text-primary text-bg-canvas",
  Pull: "bg-text-primary text-bg-canvas",
  Legs: "bg-text-primary text-bg-canvas",
  Rest: "bg-move-red-track text-move-red",
};

export default function SchedulePage() {
  const { schedule, setDaySchedule } = useSchedule();

  return (
    <main className="flex flex-1 flex-col bg-bg-canvas">
      <div className="sticky top-0 z-10 bg-bg-canvas px-5 pb-4">
        <div className="mt-6">
          <h1 className="font-title-lg text-text-primary">Schedule</h1>
        </div>
      </div>

      <div className="px-5 mt-2 flex flex-col gap-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-between rounded-2xl bg-bg-surface px-4 py-4"
          >
            <span className="font-label text-text-primary w-10">{day}</span>

            <div className="flex gap-1.5">
              {OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDaySchedule(day, opt)}
                  className={`rounded-full px-3.5 py-1 font-caption transition-colors ${
                    schedule[day] === opt
                      ? OPTION_COLORS[opt]
                      : "bg-bg-surface-elevated text-text-tertiary"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
