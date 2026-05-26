"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, DotsThreeOutlineVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import { useWorkouts, type Workout } from "@/context/WorkoutsContext";

const CATEGORIES = ["Push", "Pull", "Legs"] as const;
const ALL_CATEGORIES = ["All", ...CATEGORIES] as const;

const MUSCLES: Record<string, string[]> = {
  Push: ["Chest", "Triceps"],
  Pull: ["Back", "Biceps", "Forearms"],
  Legs: ["Leg", "Abs", "Shoulder"],
};

export default function CustomisePage() {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const [active, setActive] = useState<string>("All");
  const [panelOpen, setPanelOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Push");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpenId]);

  const filteredWorkouts =
    active === "All"
      ? workouts
      : workouts.filter((w) => w.category === active);

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    setSelectedMuscles([]);
  }

  function toggleMuscle(muscle: string) {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  }

  function handleSave() {
    if (!workoutName.trim()) return;
    const data = {
      name: workoutName.trim(),
      category: selectedCategory,
      muscles: [...selectedMuscles],
    };
    if (editingWorkout) {
      updateWorkout(editingWorkout.id, {
        ...data,
        pr: editingWorkout.pr,
        reps: editingWorkout.reps,
        recordType: editingWorkout.recordType,
      });
      setEditingWorkout(null);
    } else {
      addWorkout({ ...data, pr: 0, reps: 0, recordType: "pr" });
    }
    setPanelOpen(false);
    setWorkoutName("");
    setSelectedCategory("Push");
    setSelectedMuscles([]);
  }

  function handleEdit(workout: Workout) {
    setMenuOpenId(null);
    setEditingWorkout(workout);
    setWorkoutName(workout.name);
    setSelectedCategory(workout.category);
    setSelectedMuscles([...workout.muscles]);
    setPanelOpen(true);
  }

  function handleDelete(id: number) {
    setMenuOpenId(null);
    deleteWorkout(id);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingWorkout(null);
  }

  return (
    <main className="flex flex-1 flex-col bg-bg-canvas">
      <div className="sticky top-0 z-10 bg-bg-canvas px-5 pb-4">
        <div className="mt-6 flex items-center justify-between">
          <h1 className="font-title-lg text-text-primary">Customise</h1>
          <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-surface-elevated press-sm"
          >
            <Plus size={20} weight="bold" className="text-text-primary" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-1.5 font-label transition-all duration-200 press-sm ${
              active === cat
                ? "bg-text-primary text-bg-canvas"
                : "bg-bg-surface-elevated text-text-secondary"
            }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Workout cards */}
      <div className="px-5 mt-2 flex flex-col gap-3">
        {filteredWorkouts.map((workout) => (
          <div
            key={workout.id}
            className="relative flex items-center justify-between rounded-2xl bg-bg-surface px-4 py-4 press"
          >
            <div className="flex flex-col gap-1">
              <span className="font-label text-text-primary">
                {workout.name}
              </span>
              <span className="font-caption text-text-secondary">
                {workout.category}
                {workout.muscles.length > 0 &&
                  ` · ${workout.muscles.join(", ")}`}
              </span>
            </div>
            <button
              className="p-1"
              onClick={() =>
                setMenuOpenId(menuOpenId === workout.id ? null : workout.id)
              }
            >
              <DotsThreeOutlineVertical
                size={20}
                weight="fill"
                className="text-text-secondary"
              />
            </button>

            {menuOpenId === workout.id && (
              <div
                ref={menuRef}
                className="absolute right-4 bottom-12 z-[55] min-w-[140px] rounded-xl bg-bg-surface-elevated py-1 shadow-lg border border-white/[0.08]"
              >
                <button
                  onClick={() => handleEdit(workout)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 font-label text-text-primary"
                >
                  <PencilSimple size={18} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 font-label text-move-red"
                >
                  <Trash size={18} />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePanel}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl bg-bg-surface px-5 pb-10 pt-4 transition-transform duration-300 ease-out ${
          panelOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={closePanel}>
            <X size={22} weight="bold" className="text-text-secondary" />
          </button>
          <h2 className="font-label text-text-primary">
            {editingWorkout ? "Edit Workout" : "New Workout"}
          </h2>
          <button
            onClick={handleSave}
            className={`font-label ${
              workoutName.trim() ? "text-move-red" : "text-text-tertiary"
            }`}
          >
            Save
          </button>
        </div>

        {/* Workout name */}
        <label className="font-caption text-text-secondary mb-1.5 block">
          Workout Name
        </label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="e.g. Chest & Triceps"
          className="w-full rounded-xl bg-bg-surface-elevated px-4 py-3 font-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-1 focus:ring-text-tertiary"
        />

        {/* Category selection */}
        <label className="font-caption text-text-secondary mt-5 mb-2 block">
          Category
        </label>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full px-4 py-1.5 font-label transition-all duration-200 press-sm ${
                selectedCategory === cat
                  ? "bg-text-primary text-bg-canvas"
                  : "bg-bg-surface-elevated text-text-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Muscle selection */}
        <label className="font-caption text-text-secondary mt-5 mb-2 block">
          Muscles
        </label>
        <div className="flex gap-2 flex-wrap">
          {MUSCLES[selectedCategory].map((muscle) => (
            <button
              key={muscle}
              onClick={() => toggleMuscle(muscle)}
              className={`rounded-full px-4 py-1.5 font-label transition-all duration-200 press-sm ${
                selectedMuscles.includes(muscle)
                  ? "bg-text-primary text-bg-canvas"
                  : "bg-bg-surface-elevated text-text-secondary"
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
