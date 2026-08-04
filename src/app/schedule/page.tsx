"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { Check, DotsSixVertical, X } from "@phosphor-icons/react";
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
const SWAP_MS = 420;
const SWAP_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function SchedulePage() {
  const { schedule, dayWorkouts, setDaySchedule, toggleDayWorkout, swapDays } =
    useSchedule();
  const { workouts } = useWorkouts();
  const assignments = dayWorkouts ?? emptyDayWorkouts();
  const [scrolled, setScrolled] = useState(false);
  const [pickerDay, setPickerDay] = useState<DayKey | null>(null);
  const [draggingDay, setDraggingDay] = useState<DayKey | null>(null);
  const [dropTarget, setDropTarget] = useState<DayKey | null>(null);
  const [swapping, setSwapping] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Partial<Record<DayKey, HTMLDivElement | null>>>({});
  const dragOriginRef = useRef<DayKey | null>(null);
  const swapLockRef = useRef(false);

  const pickerType = pickerDay ? schedule[pickerDay] : null;
  const pickerOptions =
    pickerType && pickerType !== "Rest"
      ? workouts.filter((w) => w.category === pickerType)
      : [];
  const pickerSelected = pickerDay
    ? new Set(assignments[pickerDay])
    : new Set<number>();

  useEffect(() => {
    const el = mainRef.current?.closest(
      "[data-scroll-container]"
    ) as HTMLElement | null;
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

  function dayFromPoint(clientX: number, clientY: number): DayKey | null {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const row = el.closest("[data-day]") as HTMLElement | null;
    const day = row?.dataset.day as DayKey | undefined;
    return day && DAYS.includes(day) ? day : null;
  }

  function makeGhost(source: HTMLElement, rect: DOMRect, z: number) {
    const ghost = source.cloneNode(true) as HTMLElement;
    ghost.removeAttribute("data-day-card");
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.cssText = [
      "position:fixed",
      `top:${rect.top}px`,
      `left:${rect.left}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      "margin:0",
      `z-index:${z}`,
      "pointer-events:none",
      "box-sizing:border-box",
      "overflow:hidden",
      "border-radius:1rem",
      "opacity:1",
      "transform:translateZ(0)",
      "will-change:transform",
      "background-color:#1C1C1E",
    ].join(";");
    document.body.appendChild(ghost);
    return ghost;
  }

  async function animateCardSwap(from: DayKey, to: DayKey) {
    if (swapLockRef.current) return;

    const elA = cardRefs.current[from];
    const elB = cardRefs.current[to];
    if (!elA || !elB) {
      swapDays(from, to);
      return;
    }

    swapLockRef.current = true;
    setSwapping(true);

    const rectA = elA.getBoundingClientRect();
    const rectB = elB.getBoundingClientRect();

    const ghostA = makeGhost(elA, rectA, 81);
    const ghostB = makeGhost(elB, rectB, 80);

    // Lock layout so neighboring rows don't jump while cards fly
    elA.style.height = `${rectA.height}px`;
    elB.style.height = `${rectB.height}px`;
    elA.style.overflow = "hidden";
    elB.style.overflow = "hidden";
    elA.style.visibility = "hidden";
    elB.style.visibility = "hidden";

    void ghostA.getBoundingClientRect();

    const dxA = rectB.left - rectA.left;
    const dyA = rectB.top - rectA.top;
    const dxB = rectA.left - rectB.left;
    const dyB = rectA.top - rectB.top;

    const animA = ghostA.animate(
      [
        {
          transform: "translate(0px, 0px) scale(1.015)",
          boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
        },
        {
          transform: `translate(${dxA}px, ${dyA}px) scale(1.015)`,
          boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
        },
      ],
      { duration: SWAP_MS, easing: SWAP_EASE, fill: "forwards" }
    );

    const animB = ghostB.animate(
      [
        {
          transform: "translate(0px, 0px) scale(1)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        },
        {
          transform: `translate(${dxB}px, ${dyB}px) scale(1)`,
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        },
      ],
      { duration: SWAP_MS, easing: SWAP_EASE, fill: "forwards" }
    );

    try {
      await Promise.all([animA.finished, animB.finished]);
    } catch {
      // Animation cancelled — still apply swap
    }

    flushSync(() => {
      swapDays(from, to);
    });

    // Measure natural heights of swapped content, then ease into them
    elA.style.height = "auto";
    elB.style.height = "auto";
    elA.style.visibility = "hidden";
    elB.style.visibility = "hidden";
    const newHA = elA.getBoundingClientRect().height;
    const newHB = elB.getBoundingClientRect().height;
    elA.style.height = `${rectA.height}px`;
    elB.style.height = `${rectB.height}px`;

    ghostA.remove();
    ghostB.remove();

    elA.style.visibility = "";
    elB.style.visibility = "";
    void elA.offsetHeight;

    elA.style.transition = `height ${SWAP_MS * 0.55}ms ${SWAP_EASE}`;
    elB.style.transition = `height ${SWAP_MS * 0.55}ms ${SWAP_EASE}`;
    elA.style.height = `${newHA}px`;
    elB.style.height = `${newHB}px`;

    await new Promise((r) => setTimeout(r, SWAP_MS * 0.55));

    elA.style.transition = "";
    elB.style.transition = "";
    elA.style.height = "";
    elB.style.height = "";
    elA.style.overflow = "";
    elB.style.overflow = "";

    setSwapping(false);
    swapLockRef.current = false;
  }

  function endDrag(clientX: number, clientY: number) {
    const from = dragOriginRef.current;
    if (!from) return;

    const to = dayFromPoint(clientX, clientY);
    dragOriginRef.current = null;
    setDraggingDay(null);
    setDropTarget(null);

    if (to && to !== from) {
      // Let drag styles clear for one frame so clones aren't dimmed/ringed
      requestAnimationFrame(() => {
        void animateCardSwap(from, to);
      });
    }
  }

  function onHandlePointerDown(
    day: DayKey,
    e: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (e.button !== 0 || swapping) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOriginRef.current = day;
    setDraggingDay(day);
    setDropTarget(null);
  }

  function onHandlePointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragOriginRef.current || swapping) return;
    const over = dayFromPoint(e.clientX, e.clientY);
    setDropTarget(over && over !== dragOriginRef.current ? over : null);
  }

  function onHandlePointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragOriginRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    endDrag(e.clientX, e.clientY);
  }

  function onHandlePointerCancel() {
    dragOriginRef.current = null;
    setDraggingDay(null);
    setDropTarget(null);
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
        <p className="font-caption text-text-tertiary mt-1">
          Drag the handle to swap a day’s workouts
        </p>
      </div>

      <div className="px-5 mt-2 flex flex-col gap-4 pb-6">
        {DAYS.map((day) => {
          const dayType = schedule[day];
          const assignedNames = getAssignedNames(day);
          const isRest = dayType === "Rest";
          const isDragging = draggingDay === day;
          const isDropTarget = dropTarget === day;

          return (
            <div key={day} data-day={day} className="flex flex-col gap-1.5">
              <span className="font-label text-text-secondary px-0.5">
                {day}
              </span>

              <div
                ref={(el) => {
                  cardRefs.current[day] = el;
                }}
                data-day-card={day}
                className={`flex flex-col gap-2.5 rounded-2xl bg-bg-surface px-4 py-3.5 transition-[box-shadow,background-color,transform] duration-150 ${
                  isDragging ? "scale-[0.985] shadow-lg shadow-black/40" : ""
                } ${
                  isDropTarget
                    ? "ring-2 ring-move-red bg-bg-surface-elevated"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex min-w-0 flex-1 gap-1.5 flex-wrap">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setDaySchedule(day, opt)}
                        disabled={swapping}
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
                  <button
                    type="button"
                    aria-label={`Drag to swap ${day}`}
                    disabled={swapping}
                    onPointerDown={(e) => onHandlePointerDown(day, e)}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}
                    onPointerCancel={onHandlePointerCancel}
                    className="touch-none flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-surface-elevated text-text-secondary active:text-text-primary disabled:opacity-40"
                  >
                    <DotsSixVertical size={18} weight="bold" />
                  </button>
                </div>

                {!isRest && (
                  <div className="flex flex-col gap-2">
                    {assignedNames.length > 0 ? (
                      <p className="font-caption text-text-secondary leading-relaxed">
                        {assignedNames.join(" · ")}
                      </p>
                    ) : (
                      <p className="font-caption text-text-tertiary">
                        No workouts selected
                      </p>
                    )}
                    <button
                      onClick={() => setPickerDay(day)}
                      disabled={swapping}
                      className="self-start rounded-full bg-bg-surface-elevated px-3.5 py-1.5 font-caption text-text-primary press-sm"
                    >
                      {assignedNames.length > 0
                        ? "Edit workouts"
                        : "Select workouts"}
                    </button>
                  </div>
                )}
              </div>
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
              No {pickerType?.toLowerCase()} workouts in your library. Add some
              in Customise.
            </p>
          ) : (
            pickerOptions.map((workout) => {
              const selected = pickerSelected.has(workout.id);
              return (
                <button
                  key={workout.id}
                  onClick={() =>
                    pickerDay && toggleDayWorkout(pickerDay, workout.id)
                  }
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
