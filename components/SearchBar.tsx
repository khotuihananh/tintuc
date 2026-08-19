"use client";

import { useEffect, useRef, useState } from "react";
import { searchLocations } from "@/lib/api";
import { LocationResult } from "@/lib/types";

export default function SearchBar({
  onSelect,
  onUseMyLocation,
}: {
  onSelect: (loc: LocationResult) => void;
  onUseMyLocation: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchLocations(query);
        setResults(r);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative px-4 pt-3">
      <div className="flex items-center gap-2 bg-white/12 border border-white/15 rounded-full px-4 py-2.5">
        <span aria-hidden className="text-white/60">🔍</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm thành phố..."
          className="bg-transparent outline-none flex-1 text-sm placeholder:text-white/50"
        />
        <button
          onClick={() => {
            onUseMyLocation();
            setQuery("");
            setResults([]);
            setOpen(false);
          }}
          aria-label="Dùng vị trí hiện tại"
          className="text-white/70 text-base leading-none px-1"
        >
          📍
        </button>
      </div>

      {open && query.trim() && (
        <div className="absolute left-4 right-4 mt-2 bg-[#132a4c]/95 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden z-20 max-h-64 overflow-y-auto">
          {loading && <div className="px-4 py-3 text-sm text-white/60">Đang tìm...</div>}
          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-white/50">Không tìm thấy địa điểm</div>
          )}
          {!loading &&
            results.map((r, idx) => (
              <button
                key={`${r.name}-${idx}`}
                onClick={() => {
                  onSelect(r);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 border-b border-white/5 last:border-0"
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-white/50">
                  {[r.admin1, r.country].filter(Boolean).join(", ")}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
