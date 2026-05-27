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

function getToday() {
  const now = new Date();
  return {
    dayName: DAY_NAMES[now.getDay()],
    dateLabel: `${DAY_NAMES[now.getDay()]}, ${MONTH_NAMES[now.getMonth()]} ${now.getDate()}`,
  };
}

export default function Home() {
  const { dateLabel } = getToday();
  const { todayType, skipToday, isRestDay } = useSchedule();
  const { workouts, updateRecord } = useWorkouts();
  const { streak, toggleComplete, isComplete, hasSkippedToday, markSkipped } =
    useStreak();
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [recordType, setRecordType] = useState<RecordType>("pr");
  const [recordInput, setRecordInput] = useState("");
  const [confirmSkip, setConfirmSkip] = useState(false);

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

  function handleSkip() {
    skipToday();
    markSkipped();
    setConfirmSkip(false);
  }

  const panelOpen = editingWorkout !== null;

  return (
    <main className="flex flex-1 flex-col bg-bg-canvas">
      <div className="sticky top-0 z-10 bg-bg-canvas px-5 pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-title-lg text-text-primary">{todayType}</h1>
            <p className="font-caption text-text-secondary mt-0.5">{dateLabel}</p>
          </div>
          <div className="shrink-0 pt-1">
            <StreakPill days={streak} />
          </div>
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
                className={`flex items-center gap-3 rounded-2xl bg-bg-surface px-4 py-4 transition-all duration-200 ${
                  done ? "opacity-50" : ""
                }`}
              >
                <button
                  onClick={() => toggleComplete(workout.id)}
                  className="shrink-0 press-sm"
                >
                  <CheckCircle
                    size={28}
                    weight={done ? "fill" : "regular"}
                    className={`transition-colors duration-200 ${done ? "text-move-red" : "text-text-tertiary"}`}
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
                    className="flex flex-col items-end press-sm"
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

      {!isRestDay && !hasSkippedToday && (
        <div className="px-5 mt-6 pb-6">
          {confirmSkip ? (
            <div className="rounded-2xl bg-bg-surface px-4 py-4 flex flex-col gap-3">
              <p className="font-caption text-text-secondary">
                Skip today&apos;s workout? Your streak will reset and your
                schedule will shift.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSkip(false)}
                  className="flex-1 rounded-xl bg-bg-surface-elevated py-2.5 font-label text-text-secondary press-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 rounded-xl bg-move-red-track py-2.5 font-label text-move-red press-sm"
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmSkip(true)}
              className="w-full rounded-xl py-2.5 font-label text-text-tertiary press-sm"
            >
              Skip workout
            </button>
          )}
        </div>
      )}

      {!isRestDay && hasSkippedToday && (
        <div className="px-5 mt-6 pb-6 text-center">
          <p className="font-caption text-text-tertiary">
            Workout skipped for today
          </p>
        </div>
      )}

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
              className={`rounded-full px-4 py-1.5 font-label transition-all duration-200 press-sm ${
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
