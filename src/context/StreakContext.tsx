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
}

const STORAGE_KEY = "fitness-completions";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStreak(entries: CompletionEntry[], today: string, todayAllDone: boolean): number {
  const completedDates = new Set(entries.map((e) => e.date));
  let streak = 0;
  const d = new Date(today + "T00:00:00");

  if (todayAllDone) {
    streak = 1;
    d.setDate(d.getDate() - 1);
  } else {
    d.setDate(d.getDate() - 1);
  }

  while (completedDates.has(toDateStr(d))) {
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
  const [loaded, setLoaded] = useState(false);
  const today = toDateStr(new Date());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

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

  const streak = calcStreak(entries, today, allDone);

  return (
    <StreakContext.Provider
      value={{ streak, completedIds, toggleComplete, isComplete, allDone }}
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
