"use client";

import { useSchedule } from "@/context/ScheduleContext";

export default function AccountPage() {
  const { anchorRestDays, setAnchorRestDays } = useSchedule();

  return (
    <main className="flex flex-1 flex-col bg-bg-canvas px-5 pb-24">
      <div className="mt-6">
        <h1 className="font-title-lg text-text-primary">Account</h1>
      </div>

      <div className="mt-6 rounded-2xl bg-bg-surface px-4 py-6">
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
              className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.28)] ${
                anchorRestDays ? "translate-x-[21px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>
      </div>
    </main>
  );
}

