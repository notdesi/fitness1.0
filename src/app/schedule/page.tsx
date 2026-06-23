"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import { useSchedule, type DayKey, type WorkoutType } from "@/context/ScheduleContext";
import { useWorkouts } from "@/context/WorkoutsContext";
import { emptyDayWorkouts } from "@/data/program";

const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const OPTIONS: WorkoutType[] = ["Upper", "Lower", "Rest"];

const OPTION_COLORS: Record<string, string> = {
  Upper: "bg-text-primary text-bg-canvas",
  Lower: "bg-text-primary text-bg-canvas",
  Rest: "bg-move-red-track text-move-red",
};

const TITLE_TRANSITION = "opacity 300ms ease, transform 300ms ease";

export default function SchedulePage() {
  const { schedule, dayWorkouts, setDaySchedule, toggleDayWorkout } = useSchedule();
  const { workouts } = useWorkouts();
  const assignments = dayWorkouts ?? emptyDayWorkouts();
  const [scrolled, setScrolled] = useState(false);
  const [pickerDay, setPickerDay] = useState<DayKey | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const pickerType = pickerDay ? schedule[pickerDay] : null;
  const pickerOptions =
    pickerType && pickerType !== "Rest"
      ? workouts.filter((w) => w.category === pickerType)
      : [];
  const pickerSelected = pickerDay ? new Set(assignments[pickerDay]) : new Set<number>();

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

  function getAssignedNames(day: DayKey): string[] {
    const byId = new Map(workouts.map((w) => [w.id, w.name]));
    return assignments[day]
      .map((id) => byId.get(id))
      .filter((name): name is string => name != null);
  }

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

      <div className="px-5 mt-2 flex flex-col gap-2 pb-6">
        {DAYS.map((day) => {
          const dayType = schedule[day];
          const assignedNames = getAssignedNames(day);
          const isRest = dayType === "Rest";

          return (
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
                      dayType === opt
                        ? OPTION_COLORS[opt]
                        : "bg-bg-surface-elevated text-text-tertiary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {!isRest && (
                <div className="flex flex-col gap-2">
                  {assignedNames.length > 0 ? (
                    <p className="font-caption text-text-secondary leading-relaxed">
                      {assignedNames.join(" · ")}
                    </p>
                  ) : (
                    <p className="font-caption text-text-tertiary">No workouts selected</p>
                  )}
                  <button
                    onClick={() => setPickerDay(day)}
                    className="self-start rounded-full bg-bg-surface-elevated px-3.5 py-1.5 font-caption text-text-primary press-sm"
                  >
                    {assignedNames.length > 0 ? "Edit workouts" : "Select workouts"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          pickerDay ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setPickerDay(null)}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-[70] max-h-[75vh] rounded-t-2xl bg-bg-surface px-5 pb-10 pt-4 transition-transform duration-300 ease-out ${
          pickerDay ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setPickerDay(null)}>
            <X size={22} weight="bold" className="text-text-secondary" />
          </button>
          <h2 className="font-label text-text-primary">
            {pickerDay} · {pickerType}
          </h2>
          <button
            onClick={() => setPickerDay(null)}
            className="font-label text-move-red"
          >
            Done
          </button>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(75vh-5rem)]">
          {pickerOptions.length === 0 ? (
            <p className="font-caption text-text-tertiary py-4 text-center">
              No {pickerType?.toLowerCase()} workouts in your library. Add some in Customise.
            </p>
          ) : (
            pickerOptions.map((workout) => {
              const selected = pickerSelected.has(workout.id);
              return (
                <button
                  key={workout.id}
                  onClick={() => pickerDay && toggleDayWorkout(pickerDay, workout.id)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left press-sm ${
                    selected
                      ? "bg-text-primary text-bg-canvas"
                      : "bg-bg-surface-elevated text-text-primary"
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-label truncate">{workout.name}</span>
                    {workout.muscles.length > 0 && (
                      <span
                        className={`font-caption truncate ${
                          selected ? "text-bg-canvas/70" : "text-text-secondary"
                        }`}
                      >
                        {workout.muscles.join(", ")}
                      </span>
                    )}
                  </div>
                  {selected && (
                    <Check size={18} weight="bold" className="shrink-0 ml-3" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
