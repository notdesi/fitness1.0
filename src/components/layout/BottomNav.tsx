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
  const activeIndex = NAV_ITEMS.findIndex((item) => item.href === pathname);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 pb-[max(env(safe-area-inset-bottom),12px)]">
      <nav className="relative flex items-center rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] p-1 w-full max-w-sm shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Animated selection pill */}
        <div
          className="absolute top-1 bottom-1 rounded-full bg-white/[0.12] transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 8px) / ${NAV_ITEMS.length})`,
            left: `calc(4px + ${activeIndex} * (100% - 8px) / ${NAV_ITEMS.length})`,
          }}
        />

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative z-10 flex flex-1 flex-col items-center gap-0.5 py-2 rounded-full"
            >
              <Icon
                size={22}
                weight={active ? "fill" : "regular"}
                className={`transition-colors duration-300 ${active ? "text-move-red" : "text-text-secondary"}`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${
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
