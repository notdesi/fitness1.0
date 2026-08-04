"use client";

import { useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Gear,
  Scales,
  User,
  X,
} from "@phosphor-icons/react";
import { useSchedule } from "@/context/ScheduleContext";
import { useWeight } from "@/context/WeightContext";
import { ProgressiveOverloadCard } from "@/components/summary/ProgressiveOverloadCard";
import { WeightTrendCard } from "@/components/summary/WeightTrendCard";

type PanelView = "profile" | "settings" | "weight";

export default function SummaryPage() {
  const { anchorRestDays, setAnchorRestDays } = useSchedule();
  const { currentWeight, logWeight } = useWeight();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelView, setPanelView] = useState<PanelView>("profile");
  const [weightDraft, setWeightDraft] = useState("");

  function closePanel() {
    setPanelOpen(false);
    setPanelView("profile");
  }

  function openPanel() {
    setPanelView("profile");
    setPanelOpen(true);
  }

  function openWeight() {
    setWeightDraft(currentWeight != null ? String(currentWeight) : "");
    setPanelView("weight");
  }

  function saveWeight() {
    const parsed = parseFloat(weightDraft);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    logWeight(parsed);
    setPanelView("profile");
  }

  const weightValid =
    Number.isFinite(parseFloat(weightDraft)) && parseFloat(weightDraft) > 0;

  return (
    <main className="flex flex-1 flex-col bg-bg-canvas px-5 pb-24">
      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-title-lg text-text-primary">Summary</h1>
        <button
          type="button"
          aria-label="Open profile"
          onClick={openPanel}
          className="press-sm flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-bg-surface-elevated"
        >
          <User size={22} weight="fill" className="text-text-secondary" />
        </button>
      </div>

      <WeightTrendCard />
      <ProgressiveOverloadCard />

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closePanel}
      />

      {/* Profile bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] rounded-t-2xl bg-bg-surface px-5 pb-10 pt-4 transition-transform duration-300 ease-out ${
          panelOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="grid">
          {/* Profile view — keeps panel height even when hidden */}
          <div
            className={`col-start-1 row-start-1 ${
              panelView === "profile" ? "" : "invisible pointer-events-none"
            }`}
            aria-hidden={panelView !== "profile"}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="w-[22px]" />
              <h2 className="font-label text-text-primary">Profile</h2>
              <button type="button" aria-label="Close profile" onClick={closePanel}>
                <X size={22} weight="bold" className="text-text-secondary" />
              </button>
            </div>

            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-bg-surface-elevated">
                <User size={40} weight="fill" className="text-text-tertiary" />
              </div>
              <p className="font-label text-text-primary">Amar Nihal</p>
              <p className="mt-1 font-caption text-text-secondary">
                amarnihaal@gmail.com
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={openWeight}
                className="press-sm flex w-full items-center gap-3 rounded-2xl bg-bg-surface-elevated px-4 py-4"
              >
                <Scales size={20} className="text-text-secondary" />
                <span className="flex-1 text-left font-label text-text-primary">
                  Weight
                </span>
                <span className="font-caption text-text-secondary">
                  {currentWeight != null ? `${currentWeight} kg` : "Add"}
                </span>
                <CaretRight size={18} className="text-text-tertiary" />
              </button>

              <button
                type="button"
                onClick={() => setPanelView("settings")}
                className="press-sm flex w-full items-center gap-3 rounded-2xl bg-bg-surface-elevated px-4 py-4"
              >
                <Gear size={20} className="text-text-secondary" />
                <span className="flex-1 text-left font-label text-text-primary">
                  Settings
                </span>
                <CaretRight size={18} className="text-text-tertiary" />
              </button>
            </div>
          </div>

          {/* Settings view */}
          <div
            className={`col-start-1 row-start-1 ${
              panelView === "settings" ? "" : "invisible pointer-events-none"
            }`}
            aria-hidden={panelView !== "settings"}
          >
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                aria-label="Back to profile"
                onClick={() => setPanelView("profile")}
              >
                <CaretLeft size={22} weight="bold" className="text-text-secondary" />
              </button>
              <h2 className="font-label text-text-primary">Settings</h2>
              <button type="button" aria-label="Close profile" onClick={closePanel}>
                <X size={22} weight="bold" className="text-text-secondary" />
              </button>
            </div>

            <div className="rounded-2xl bg-bg-surface-elevated px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-label text-text-secondary">
                  Anchor rest days while skipping
                </p>

                <button
                  type="button"
                  role="switch"
                  aria-checked={anchorRestDays}
                  aria-label="Anchor rest days while skipping"
                  onClick={() => setAnchorRestDays(!anchorRestDays)}
                  className={`relative inline-flex h-8 w-[52px] items-center rounded-full border transition-all duration-200 ${
                    anchorRestDays
                      ? "bg-[#34C759] border-[#34C759]"
                      : "bg-[#E5E5EA] border-[#E5E5EA]"
                  }`}
                >
                  <span
                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)] transition-transform duration-200 ${
                      anchorRestDays ? "translate-x-[21px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Weight view */}
          <div
            className={`col-start-1 row-start-1 ${
              panelView === "weight" ? "" : "invisible pointer-events-none"
            }`}
            aria-hidden={panelView !== "weight"}
          >
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                aria-label="Back to profile"
                onClick={() => setPanelView("profile")}
              >
                <CaretLeft size={22} weight="bold" className="text-text-secondary" />
              </button>
              <h2 className="font-label text-text-primary">Weight</h2>
              <button type="button" aria-label="Close profile" onClick={closePanel}>
                <X size={22} weight="bold" className="text-text-secondary" />
              </button>
            </div>

            <label className="mb-1.5 block font-caption text-text-secondary">
              Body weight (kg)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step={0.1}
              value={weightDraft}
              onChange={(e) => setWeightDraft(e.target.value)}
              placeholder="e.g. 72.5"
              className="w-full rounded-xl bg-bg-surface-elevated px-4 py-3 font-body text-text-primary placeholder:text-text-tertiary outline-none focus:ring-1 focus:ring-text-tertiary"
            />

            <button
              type="button"
              onClick={saveWeight}
              disabled={!weightValid}
              className={`mt-5 w-full rounded-2xl py-3.5 font-label transition-colors ${
                weightValid
                  ? "bg-move-red text-white press-sm"
                  : "bg-bg-surface-elevated text-text-tertiary"
              }`}
            >
              {currentWeight != null ? "Update weight" : "Save weight"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
