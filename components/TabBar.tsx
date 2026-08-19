"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/gold", label: "Giá vàng", icon: "🪙" },
  { href: "/btc", label: "Giá BTC", icon: "₿" },
  { href: "/fuel", label: "Giá xăng", icon: "⛽" },
  { href: "/bank", label: "Lãi suất", icon: "🏦" },
  { href: "/premier-league", label: "Ngoại hạng", icon: "⚽" },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-[#0c1c33]/95 backdrop-blur-xl border-t border-white/10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-label="Điều hướng chính">
      <div className="max-w-md md:max-w-lg mx-auto grid grid-cols-5">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-3 text-center transition-colors ${active ? "text-amber-300" : "text-white/50 hover:text-white/80"}`}>
              <span className="text-lg leading-none" aria-hidden>{tab.icon}</span>
              <span className="truncate text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
