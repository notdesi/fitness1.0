"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type RecordType = "pr" | "reps";

export interface Workout {
  id: number;
  name: string;
  category: string;
  muscles: string[];
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
}

const STORAGE_KEY = "fitness-workouts";

const WorkoutsContext = createContext<WorkoutsContextValue | null>(null);

export function WorkoutsProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [nextId, setNextId] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Workout[];
        const migrated = parsed.map((w) => ({
          ...w,
          pr: w.pr ?? 0,
          reps: w.reps ?? 0,
          recordType: w.recordType ?? "pr" as RecordType,
        }));
        setWorkouts(migrated);
        const maxId = migrated.reduce((max, w) => Math.max(max, w.id), 0);
        setNextId(maxId + 1);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    }
  }, [workouts, loaded]);

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
  }

  function deleteWorkout(id: number) {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <WorkoutsContext.Provider value={{ workouts, addWorkout, updateWorkout, updateRecord, deleteWorkout }}>
      {children}
    </WorkoutsContext.Provider>
  );
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error("useWorkouts must be used within WorkoutsProvider");
  return ctx;
}
