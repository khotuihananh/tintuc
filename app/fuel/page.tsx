"use client";

import { useCallback, useEffect, useState } from "react";
import { FuelData, FuelItem, fetchFuelData, pickFeatured } from "@/lib/fuel";

function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + " đ";
}

export default function FuelPage() {
  const [data, setData] = useState<FuelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchFuelData();
      setData(d);
    } catch {
      setError("Không thể tải dữ liệu giá xăng dầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const featured = data ? pickFeatured(data.items) : undefined;
  const others = data ? data.items.filter((i) => i !== featured) : [];

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center transition-[background] duration-700"
      style={{ background: "linear-gradient(180deg,#0e2318 0%,#173a26 45%,#1f4a30 100%)" }}
    >
      <div className="w-full max-w-md md:max-w-5xl px-5 md:px-0 pt-8 pb-28">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden>⛽</span>
          <h1 className="font-display font-bold text-lg">Giá xăng dầu trong nước</h1>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Nguồn: Petrolimex{data?.date ? ` · Áp dụng từ ${data.date}` : ""}
        </p>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-white/70 text-sm">Đang tải giá xăng dầu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 text-center py-24">
            <p className="text-white/80">{error}</p>
            <button onClick={load} className="px-4 py-2 rounded-full bg-white/15 text-sm">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="animate-rise md:grid md:grid-cols-[360px_1fr] md:gap-6 md:items-start">
            {/* Hero: featured fuel price */}
            {featured && (
              <div className="md:bg-white/10 md:backdrop-blur-xl md:rounded-[32px] md:border md:border-white/15 md:p-7 md:shadow-2xl">
                <p className="text-sm text-white/70">{featured.name}</p>
                <div className="mt-3 divide-y divide-white/10">
                  <div className="py-3 first:pt-0">
                    <p className="text-xs text-white/50">Vùng 1</p>
                    <p className="font-display font-light text-2xl sm:text-3xl mt-0.5 truncate">
                      {formatVnd(featured.region1)}
                    </p>
                  </div>
                  <div className="py-3 last:pb-0">
                    <p className="text-xs text-white/50">Vùng 2</p>
                    <p className="font-display font-light text-2xl sm:text-3xl mt-0.5 truncate">
                      {formatVnd(featured.region2)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/45 mt-6">
                  Đơn vị: VNĐ/lít · Vùng 2 áp dụng cho địa bàn xa kho đầu mối, giá cao hơn tối đa 2%
                </p>
              </div>
            )}

            {/* List of all other fuel types */}
            <div className="mt-5 md:mt-0 rounded-[28px] bg-white/10 backdrop-blur-md border border-white/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-3 text-xs text-white/50 border-b border-white/10">
                <span>Loại nhiên liệu</span>
                <span className="text-right">Vùng 1</span>
                <span className="text-right">Vùng 2</span>
              </div>
              {others.map((item) => (
                <FuelRow key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function FuelRow({ item }: { item: FuelItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-sm truncate pr-2">{item.name}</span>
      <span className="text-sm text-right font-medium tabular-nums">{formatVnd(item.region1)}</span>
      <span className="text-sm text-right font-medium tabular-nums">{formatVnd(item.region2)}</span>
    </div>
  );
}
