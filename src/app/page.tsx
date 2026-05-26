"use client";

import { useState } from "react";
import { X, CheckCircle } from "@phosphor-icons/react";
import { StreakPill } from "@/components/ui/StreakPill";
import { useSchedule } from "@/context/ScheduleContext";
import { useWorkouts, type Workout, type RecordType } from "@/context/WorkoutsContext";
import { useStreak } from "@/context/StreakContext";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const PILL_COLORS: Record<string, string> = {
  Push: "bg-bg-surface-elevated text-text-primary",
  Pull: "bg-bg-surface-elevated text-text-primary",
  Legs: "bg-bg-surface-elevated text-text-primary",
  Rest: "bg-move-red-track text-move-red",
};

function getToday() {
  const now = new Date();
  return {
    dayName: DAY_NAMES[now.getDay()],
    dateLabel: `${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`,
  };
}

export default function Home() {
  const { dayName, dateLabel } = getToday();
  const { todayType } = useSchedule();
  const { workouts, updateRecord } = useWorkouts();
  const { streak, toggleComplete, isComplete } = useStreak();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [recordType, setRecordType] = useState<RecordType>("pr");
  const [recordInput, setRecordInput] = useState("");

  const todayWorkouts =
    todayType === "Rest"
      ? []
      : workouts.filter((w) => w.category === todayType);

  function openRecordPanel(workout: Workout) {
    setEditingWorkout(workout);
    const type = workout.recordType || "pr";
    setRecordType(type);
    const val = type === "pr" ? workout.pr : workout.reps;
    setRecordInput(val > 0 ? String(val) : "");
  }

  function closePanel() {
    setEditingWorkout(null);
    setRecordInput("");
  }

  function handleTypeChange(type: RecordType) {
    setRecordType(type);
    if (editingWorkout) {
      const val = type === "pr" ? editingWorkout.pr : (editingWorkout.reps || 0);
      setRecordInput(val > 0 ? String(val) : "");
    }
  }

  function saveRecord() {
    if (!editingWorkout) return;
    const value = parseFloat(recordInput) || 0;
    updateRecord(editingWorkout.id, recordType, value);
    closePanel();
  }

  const panelOpen = editingWorkout !== null;

  return (
    <main className="flex flex-1 flex-col bg-bg-canvas">
      <div className="sticky top-0 z-10 bg-bg-canvas px-5 pb-4">
        <header className="flex items-center justify-center pt-4 pb-3">
          <StreakPill days={streak} />
        </header>

        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="font-title-lg text-text-primary">{dayName}</h1>
            <p className="font-caption text-text-secondary mt-0.5">{dateLabel}</p>
          </div>
          <span
            className={`mt-1 rounded-full px-3.5 py-1 font-label ${PILL_COLORS[todayType]}`}
          >
            {todayType}
          </span>
        </div>
      </div>

      <div className="px-5 mt-2 flex flex-col gap-3">
        {todayType === "Rest" ? (
          <div className="rounded-2xl bg-bg-surface px-4 py-6 text-center">
            <p className="font-label text-text-secondary">Rest Day</p>
            <p className="font-caption text-text-tertiary mt-1">
              Take it easy and recover
            </p>
          </div>
        ) : todayWorkouts.length === 0 ? (
          <div className="rounded-2xl bg-bg-surface px-4 py-6 text-center">
            <p className="font-label text-text-secondary">No workouts yet</p>
            <p className="font-caption text-text-tertiary mt-1">
              Add {todayType} workouts in Customise
            </p>
          </div>
        ) : (
          todayWorkouts.map((workout) => {
            const done = isComplete(workout.id);
            return (
              <div
                key={workout.id}
                className={`flex items-center gap-3 rounded-2xl bg-bg-surface px-4 py-4 transition-opacity ${
                  done ? "opacity-50" : ""
                }`}
              >
                <button
                  onClick={() => toggleComplete(workout.id)}
                  className="shrink-0"
                >
                  <CheckCircle
                    size={28}
                    weight={done ? "fill" : "regular"}
                    className={done ? "text-move-red" : "text-text-tertiary"}
                  />
                </button>

                <div className="flex flex-1 items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`font-label ${
                        done
                          ? "text-text-secondary line-through"
                          : "text-text-primary"
                      }`}
                    >
                      {workout.name}
                    </span>
                    {workout.muscles.length > 0 && (
                      <p className="font-caption text-text-secondary">
                        {workout.muscles.join(", ")}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => openRecordPanel(workout)}
                    className="flex flex-col items-end"
                  >
                    <span className="font-title-md text-move-red">
                      {(workout.recordType === "reps"
                        ? workout.reps
                        : workout.pr) > 0
                        ? workout.recordType === "reps"
                          ? workout.reps
                          : workout.pr
                        : "–"}
                    </span>
                    <span className="font-unit text-move-red/60">
                      {workout.recordType === "reps" ? "REPS" : "PR kg"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePanel}
      />

      {/* Record Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl bg-bg-surface px-5 pb-10 pt-4 transition-transform duration-300 ease-out ${
          panelOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <button onClick={closePanel}>
            <X size={22} weight="bold" className="text-text-secondary" />
          </button>
          <h2 className="font-label text-text-primary">Update Record</h2>
          <button
            onClick={saveRecord}
            className={`font-label ${
              recordInput.trim() ? "text-move-red" : "text-text-tertiary"
            }`}
          >
            Save
          </button>
        </div>

        {editingWorkout && (
          <p className="font-caption text-text-secondary mb-4">
            {editingWorkout.name}
          </p>
        )}

        <label className="font-caption text-text-secondary mb-2 block">
          Type
        </label>
        <div className="flex gap-2 mb-5">
          {(["pr", "reps"] as const).map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`rounded-full px-4 py-1.5 font-label transition-colors ${
                recordType === type
                  ? "bg-text-primary text-bg-canvas"
                  : "bg-bg-surface-elevated text-text-secondary"
              }`}
            >
              {type === "pr" ? "PR (kg)" : "Reps"}
            </button>
          ))}
        </div>

        <label className="font-caption text-text-secondary mb-1.5 block">
          {recordType === "pr" ? "Weight (kg)" : "Reps"}
        </label>
        <input
          type="number"
          value={recordInput}
          onChange={(e) => setRecordInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveRecord();
          }}
          placeholder="0"
          className="w-full rounded-xl bg-bg-surface-elevated px-4 py-3 font-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-1 focus:ring-text-tertiary"
        />
      </div>
    </main>
  );
}
