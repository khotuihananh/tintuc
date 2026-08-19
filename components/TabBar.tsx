"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/gold", label: "Giá vàng", icon: "🪙" },
  { href: "/btc", label: "Giá BTC", icon: "₿" },
  { href: "/fuel", label: "Giá xăng", icon: "⛽" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-[#0c1c33]/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Điều hướng chính"
    >
      <div className="max-w-md md:max-w-lg mx-auto grid grid-cols-3">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                active ? "text-amber-400" : "text-white/55"
              }`}
            >
              <span className="text-lg leading-none" aria-hidden>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
