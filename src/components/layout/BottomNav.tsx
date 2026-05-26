"use client";

import { Barbell, SlidersHorizontal, CalendarBlank } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Workout", icon: Barbell },
  { href: "/schedule", label: "Schedule", icon: CalendarBlank },
  { href: "/customise", label: "Customise", icon: SlidersHorizontal },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-0 z-50 flex justify-center px-5 pb-[max(env(safe-area-inset-bottom),12px)]">
      <nav className="flex items-center justify-around rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] px-2 py-1.5 w-full max-w-xs shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-6 py-1"
            >
              <Icon
                size={22}
                weight={active ? "fill" : "regular"}
                className={active ? "text-move-red" : "text-text-secondary"}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-move-red" : "text-text-secondary"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
