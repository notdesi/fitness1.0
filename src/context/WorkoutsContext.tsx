"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

import {
  DEFAULT_PROGRAM_WORKOUTS,
  PROGRAM_SEED_KEY,
  PROGRAM_SEED_VERSION,
  type ProgramDay,
} from "@/data/program";

export type RecordType = "pr" | "reps";

export interface RecordHistoryEntry {
  date: string;
  type: RecordType;
  value: number;
}

export interface Workout {
  id: number;
  name: string;
  category: string;
  muscles: string[];
  programDay?: ProgramDay;
  pr: number;
  reps: number;
  recordType: RecordType;
}

interface WorkoutsContextValue {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, "id">) => void;
  updateWorkout: (id: number, data: Omit<Workout, "id">) => void;
  updateRecord: (id: number, recordType: RecordType, value: number) => void;
  deleteWorkout: (id: number) => void;
  getHistory: (workoutId: number) => RecordHistoryEntry[];
}

const STORAGE_KEY = "fitness-workouts";
const HISTORY_KEY = "fitness-record-history";

function migrateCategory(category: string): string {
  if (category === "Push" || category === "Pull") return "Upper";
  if (category === "Legs") return "Lower";
  return category;
}

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nextId, setNextId] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState<Record<number, RecordHistoryEntry[]>>({});

  useEffect(() => {
    const shouldSeed =
      localStorage.getItem(PROGRAM_SEED_KEY) !== String(PROGRAM_SEED_VERSION);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && !shouldSeed) {
        const parsed = JSON.parse(stored) as Workout[];
        const migrated = parsed.map((w) => ({
          ...w,
          category: migrateCategory(w.category),
          pr: w.pr ?? 0,
          reps: w.reps ?? 0,
          recordType: w.recordType ?? "pr" as RecordType,
        }));
        setWorkouts(migrated);
        const maxId = migrated.reduce((max, w) => Math.max(max, w.id), 0);
        setNextId(maxId + 1);
      } else {
        const seeded = DEFAULT_PROGRAM_WORKOUTS.map((w, i) => ({
          ...w,
          id: i + 1,
        }));
        setWorkouts(seeded);
        setNextId(seeded.length + 1);
        localStorage.setItem(PROGRAM_SEED_KEY, String(PROGRAM_SEED_VERSION));
      }
    } catch {}
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    }
  }, [workouts, loaded]);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history, loaded]);

  function addWorkout(data: Omit<Workout, "id">) {
    setWorkouts((prev) => [...prev, { ...data, id: nextId }]);
    setNextId((n) => n + 1);
  }

  function updateWorkout(id: number, data: Omit<Workout, "id">) {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...data, id } : w))
    );
  }

  function updateRecord(id: number, recordType: RecordType, value: number) {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, recordType, [recordType === "pr" ? "pr" : "reps"]: value }
          : w
      )
    );
    const entry: RecordHistoryEntry = {
      date: new Date().toISOString(),
      type: recordType,
      value,
    };
    setHistory((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), entry],
    }));
  }

  function deleteWorkout(id: number) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  function getHistory(workoutId: number): RecordHistoryEntry[] {
    return history[workoutId] ?? [];
  }

  return (
    <WorkoutsContext.Provider value={{ workouts, addWorkout, updateWorkout, updateRecord, deleteWorkout, getHistory }}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error("useWorkouts must be used within WorkoutsProvider");
  return ctx;
}
