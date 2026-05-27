"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface CompletionEntry {
  date: string;
  completedIds: number[];
}

interface StreakContextValue {
  streak: number;
  completedIds: number[];
  toggleComplete: (id: number) => void;
  isComplete: (id: number) => boolean;
  allDone: boolean;
  hasSkippedToday: boolean;
  markSkipped: () => void;
}

const STORAGE_KEY = "fitness-completions";
const SKIPPED_KEY = "fitness-skipped-dates";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStreak(
  entries: CompletionEntry[],
  skippedDates: string[],
  today: string,
  todayAllDone: boolean,
  todaySkipped: boolean
): number {
  if (todaySkipped) return 0;

  const completedDates = new Set(entries.map((e) => e.date));
  const skipped = new Set(skippedDates);
  let streak = 0;
  const d = new Date(today + "T00:00:00");

  if (todayAllDone) {
    streak = 1;
    d.setDate(d.getDate() - 1);
  } else {
    d.setDate(d.getDate() - 1);
  }

  while (completedDates.has(toDateStr(d))) {
    if (skipped.has(toDateStr(d))) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }

  return streak;
}

const StreakContext = createContext<StreakContextValue | null>(null);

export function StreakProvider({
  children,
  todayRequiredIds,
  isRestDay,
}: {
  children: ReactNode;
  todayRequiredIds: number[];
  isRestDay: boolean;
}) {
  const [entries, setEntries] = useState<CompletionEntry[]>([]);
  const [skippedDates, setSkippedDates] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const today = toDateStr(new Date());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch {}
    try {
      const storedSkipped = localStorage.getItem(SKIPPED_KEY);
      if (storedSkipped) setSkippedDates(JSON.parse(storedSkipped));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem(SKIPPED_KEY, JSON.stringify(skippedDates));
  }, [skippedDates, loaded]);

  const todayEntry = entries.find((e) => e.date === today);
  const completedIds = todayEntry?.completedIds ?? [];

  const allDone = isRestDay
    ? true
    : todayRequiredIds.length > 0 &&
      todayRequiredIds.every((id) => completedIds.includes(id));

  // Auto-mark rest days
  useEffect(() => {
    if (!loaded || !isRestDay) return;
    const alreadyMarked = entries.some((e) => e.date === today);
    if (!alreadyMarked) {
      setEntries((prev) => [...prev, { date: today, completedIds: [] }]);
    }
  }, [isRestDay, loaded, today, entries]);

  const toggleComplete = useCallback(
    (id: number) => {
      setEntries((prev) => {
        const existing = prev.find((e) => e.date === today);
        if (existing) {
          return prev.map((e) => {
            if (e.date !== today) return e;
            const ids = e.completedIds.includes(id)
              ? e.completedIds.filter((x) => x !== id)
              : [...e.completedIds, id];
            return { ...e, completedIds: ids };
          });
        }
        return [...prev, { date: today, completedIds: [id] }];
      });
    },
    [today]
  );

  const isComplete = useCallback(
    (id: number) => completedIds.includes(id),
    [completedIds]
  );

  const hasSkippedToday = skippedDates.includes(today);

  const markSkipped = useCallback(() => {
    setSkippedDates((prev) => (prev.includes(today) ? prev : [...prev, today]));
    setEntries((prev) => prev.filter((e) => e.date !== today));
  }, [today]);

  const streak = calcStreak(
    entries,
    skippedDates,
    today,
    allDone,
    hasSkippedToday
  );

  return (
    <StreakContext.Provider
      value={{
        streak,
        completedIds,
        toggleComplete,
        isComplete,
        allDone,
        hasSkippedToday,
        markSkipped,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error("useStreak must be used within StreakProvider");
  return ctx;
}
