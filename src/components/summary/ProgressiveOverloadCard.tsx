"use client";

import {
  useWorkouts,
  type RecordHistoryEntry,
} from "@/context/WorkoutsContext";

function prEntries(history: RecordHistoryEntry[]) {
  return history
    .filter((e) => e.type === "pr")
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** True if any later PR exceeds the best prior PR (actual progressive overload). */
function hasPrImprovement(history: RecordHistoryEntry[]): boolean {
  const prs = prEntries(history);
  if (prs.length < 2) return false;
  let peak = prs[0].value;
  for (let i = 1; i < prs.length; i++) {
    if (prs[i].value > peak) return true;
    peak = Math.max(peak, prs[i].value);
  }
  return false;
}

export function ProgressiveOverloadCard() {
  const { workouts, getHistory } = useWorkouts();

  const weightTracked = workouts.filter(
    (w) => prEntries(getHistory(w.id)).length > 0
  );
  const improved = weightTracked.filter((w) =>
    hasPrImprovement(getHistory(w.id))
  );

  const total = weightTracked.length;
  const count = improved.length;
  const pct = total > 0 ? Math.round((count / total) * 100) : null;

  return (
    <section className="mt-4 rounded-2xl bg-bg-surface px-4 pb-4 pt-4">
      <p className="font-caption text-text-secondary">Progressive Overload</p>
      <p className="mt-1 font-title-md text-text-primary">
        {pct != null ? `${pct}%` : "—"}
      </p>

      {total > 0 ? (
        <>
          <p className="mt-2 font-caption text-text-secondary">
            {count} of {total} lift{total === 1 ? "" : "s"} improved
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg-surface-elevated">
            <div
              className="h-full rounded-full bg-[#34C759] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      ) : (
        <div className="mt-4 flex h-[72px] items-center justify-center rounded-xl bg-bg-surface-elevated px-4">
          <p className="text-center font-caption text-text-secondary">
            Update workout PRs (kg) to track progressive overload
          </p>
        </div>
      )}
    </section>
  );
}
