"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type WeightEntry = { date: string; kg: number };

interface WeightContextValue {
  entries: WeightEntry[];
  currentWeight: number | null;
  loaded: boolean;
  logWeight: (kg: number) => void;
}

const STORAGE_KEY = "fitness-user-weight";

export function toDateStr(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseStored(raw: string): WeightEntry[] {
  const parsed = JSON.parse(raw);

  // Migrate legacy single-number storage
  if (typeof parsed === "number" && Number.isFinite(parsed) && parsed > 0) {
    return [{ date: toDateStr(), kg: Math.round(parsed * 10) / 10 }];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(
      (e): e is WeightEntry =>
        e &&
        typeof e.date === "string" &&
        typeof e.kg === "number" &&
        Number.isFinite(e.kg) &&
        e.kg > 0
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function entriesInRange(
  entries: WeightEntry[],
  rangeDays: number,
  now = new Date()
): WeightEntry[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (rangeDays - 1));
  const startStr = toDateStr(start);
  return entries.filter((e) => e.date >= startStr);
}

export function percentChange(entries: WeightEntry[]): number | null {
  if (entries.length < 2) return null;
  const first = entries[0].kg;
  const last = entries[entries.length - 1].kg;
  if (first === 0) return null;
  return ((last - first) / first) * 100;
}

const WeightContext = createContext<WeightContextValue | null>(null);

export function WeightProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEntries(parseStored(stored));
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, loaded]);

  function logWeight(kg: number) {
    const rounded = Math.round(kg * 10) / 10;
    if (!Number.isFinite(rounded) || rounded <= 0) return;
    const date = toDateStr();
    setEntries((prev) => {
      const withoutToday = prev.filter((e) => e.date !== date);
      return [...withoutToday, { date, kg: rounded }].sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    });
  }

  const currentWeight =
    entries.length > 0 ? entries[entries.length - 1].kg : null;

  return (
    <WeightContext.Provider
      value={{ entries, currentWeight, loaded, logWeight }}
    >
      {children}
    </WeightContext.Provider>
  );
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight must be used within WeightProvider");
  return ctx;
}
