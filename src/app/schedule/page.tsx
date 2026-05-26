"use client";

import { useEffect, useRef, useState } from "react";
import { useSchedule, type DayKey, type WorkoutType } from "@/context/ScheduleContext";

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const OPTIONS: WorkoutType[] = ["Push", "Pull", "Legs", "Rest"];

const OPTION_COLORS: Record<string, string> = {
  Push: "bg-text-primary text-bg-canvas",
  Pull: "bg-text-primary text-bg-canvas",
  Legs: "bg-text-primary text-bg-canvas",
  Rest: "bg-move-red-track text-move-red",
};

const TITLE_TRANSITION = "opacity 300ms ease, transform 300ms ease";

export default function SchedulePage() {
  const { schedule, setDaySchedule } = useSchedule();
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = mainRef.current?.closest("[data-scroll-container]") as HTMLElement | null;
    const target = el || window;
    const handler = () => {
      const y = el ? el.scrollTop : window.scrollY;
      setScrolled(y > 20);
    };
    target.addEventListener("scroll", handler, { passive: true });
    return () => target.removeEventListener("scroll", handler);
  }, []);

  return (
    <main ref={mainRef} className="flex flex-1 flex-col bg-bg-canvas">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-bg-canvas via-bg-canvas to-transparent px-5 pb-4">
        <div className="relative mt-6 h-10 flex items-center">
          <h1
            className="absolute left-0 font-title-lg text-text-primary"
            style={{
              transition: TITLE_TRANSITION,
              opacity: scrolled ? 0 : 1,
              transform: scrolled ? "translateY(-4px)" : "translateY(0)",
            }}
          >
            Schedule
          </h1>
          <h1
            className="absolute inset-x-0 text-center font-label text-text-primary"
            style={{
              transition: TITLE_TRANSITION,
              opacity: scrolled ? 1 : 0,
              transform: scrolled ? "translateY(0)" : "translateY(4px)",
            }}
          >
            Schedule
          </h1>
        </div>
      </div>

      <div className="px-5 mt-2 flex flex-col gap-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex flex-col gap-3 rounded-2xl bg-bg-surface px-4 py-4"
          >
            <span className="font-label text-text-primary">{day}</span>

            <div className="flex gap-1.5">
              {OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDaySchedule(day, opt)}
                  className={`rounded-full px-3.5 py-1 font-caption transition-all duration-200 press-sm ${
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
