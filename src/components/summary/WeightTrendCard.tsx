"use client";

import { useId, useState } from "react";
import {
  entriesInRange,
  percentChange,
  useWeight,
  type WeightEntry,
} from "@/context/WeightContext";

const RANGES = [
  { id: "6m", label: "6M", days: 182 },
  { id: "3m", label: "3M", days: 91 },
  { id: "1m", label: "1M", days: 30 },
  { id: "1w", label: "1W", days: 7 },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

const CHART_W = 320;
const CHART_H = 120;
const PAD_X = 8;
const PAD_Y = 12;

function buildPath(entries: WeightEntry[]) {
  const min = Math.min(...entries.map((e) => e.kg));
  const max = Math.max(...entries.map((e) => e.kg));
  const span = max - min || 1;
  const innerW = CHART_W - PAD_X * 2;
  const innerH = CHART_H - PAD_Y * 2;

  const points = entries.map((e, i) => {
    const x =
      entries.length === 1
        ? CHART_W / 2
        : PAD_X + (i / (entries.length - 1)) * innerW;
    const y = PAD_Y + (1 - (e.kg - min) / span) * innerH;
    return { x, y };
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1].x.toFixed(1)} ${CHART_H} L ${points[0].x.toFixed(1)} ${CHART_H} Z`
      : "";

  return { line, area, points };
}

function formatPct(value: number) {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

export function WeightTrendCard() {
  const { entries, currentWeight } = useWeight();
  const [range, setRange] = useState<RangeId>("1m");
  const gradId = useId();

  const days = RANGES.find((r) => r.id === range)!.days;
  const ranged = entriesInRange(entries, days);
  const pct = percentChange(ranged);
  const hasChart = ranged.length >= 2;

  let pctClass = "text-text-secondary";
  if (pct != null) {
    if (pct > 0) pctClass = "text-[#34C759]";
    else if (pct < 0) pctClass = "text-move-red";
  }

  const { line, area, points } = hasChart
    ? buildPath(ranged)
    : { line: "", area: "", points: [] as { x: number; y: number }[] };

  const stroke =
    pct == null ? "#8E8E93" : pct >= 0 ? "#34C759" : "#FA114F";

  return (
    <section className="mt-6 rounded-2xl bg-bg-surface px-4 pb-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-caption text-text-secondary">Weight</p>
          <p className="mt-1 font-title-md text-text-primary">
            {currentWeight != null ? `${currentWeight} kg` : "—"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1 rounded-full bg-bg-surface-elevated p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded-full px-2.5 py-1 font-caption transition-all duration-200 press-sm ${
                  range === r.id
                    ? "bg-text-primary text-bg-canvas"
                    : "text-text-secondary"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className={`font-label ${pctClass}`}>
            {pct != null ? formatPct(pct) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 h-[120px]">
        {hasChart ? (
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="h-full w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label="Weight trend"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradId})`} />
            <path
              d={line}
              fill="none"
              stroke={stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="4"
                fill={stroke}
              />
            )}
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl bg-bg-surface-elevated px-4">
            <p className="text-center font-caption text-text-secondary">
              {currentWeight == null
                ? "Add your weight to see a trend"
                : "Log another weigh-in to see your trend"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
