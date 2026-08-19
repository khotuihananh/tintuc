"use client";

import { useCallback, useEffect, useState } from "react";
import { GoldData, GoldItem, PRIMARY_CODE, fetchGoldData } from "@/lib/gold";
import Sparkline from "@/components/Sparkline";

function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

function formatUpdated(unixSeconds: number): string {
  const mins = Math.max(0, Math.round((Date.now() - unixSeconds * 1000) / 60000));
  if (mins < 1) return "vừa xong";
  if (mins === 1) return "1 phút trước";
  return `${mins} phút trước`;
}

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-xs text-white/45">Không đổi</span>;
  }
  const positive = value > 0;
  return (
    <span className={`text-xs font-medium ${positive ? "text-emerald-300" : "text-red-300"}`}>
      {positive ? "▲" : "▼"} {formatVnd(Math.abs(value))}
    </span>
  );
}

export default function GoldPage() {
  const [data, setData] = useState<GoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchGoldData();
      setData(d);
    } catch {
      setError("Không thể tải dữ liệu giá vàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const primary = data?.items.find((i) => i.code === PRIMARY_CODE);
  const others = data?.items.filter((i) => i.code !== PRIMARY_CODE) ?? [];
  const trendUp = (primary?.changeSell ?? 0) >= 0;
  const history = data?.history ?? [];
  const historyPositive =
    history.length >= 2 ? history[history.length - 1].sell >= history[0].sell : trendUp;

  const bg =
    loading || error
      ? "linear-gradient(180deg,#141a26 0%,#1b2333 100%)"
      : trendUp
      ? "linear-gradient(180deg,#241c05 0%,#3d2f08 45%,#4f3d0b 100%)"
      : "linear-gradient(180deg,#1a1c2b 0%,#242840 45%,#2f3352 100%)";

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center transition-[background] duration-700"
      style={{ background: bg }}
    >
      <div className="w-full max-w-md md:max-w-5xl px-5 md:px-0 pt-8 pb-28">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden>🪙</span>
          <h1 className="font-display font-bold text-lg">Giá vàng trong nước</h1>
        </div>
        <p className="text-sm text-white/60 mb-6">Nguồn: vang.today · Đơn vị: VNĐ/lượng</p>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-white/70 text-sm">Đang tải giá vàng...</p>
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
            {/* Hero: SJC benchmark price + history chart */}
            {primary && (
              <div className="md:bg-white/10 md:backdrop-blur-xl md:rounded-[32px] md:border md:border-white/15 md:p-7 md:shadow-2xl">
                <p className="text-sm text-white/70">{primary.label}</p>
                <div className="mt-3 divide-y divide-white/10">
                  <div className="py-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-white/50">Mua vào</p>
                      <p className="font-display font-light text-2xl sm:text-3xl mt-0.5 truncate">
                        {formatVnd(primary.buy)}
                      </p>
                    </div>
                    <div className="shrink-0"><ChangeBadge value={primary.changeBuy} /></div>
                  </div>
                  <div className="py-3 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-white/50">Bán ra</p>
                      <p className="font-display font-light text-2xl sm:text-3xl mt-0.5 truncate">
                        {formatVnd(primary.sell)}
                      </p>
                    </div>
                    <div className="shrink-0"><ChangeBadge value={primary.changeSell} /></div>
                  </div>
                </div>

                {history.length >= 2 && (
                  <div className="mt-6 -mx-1">
                    <Sparkline data={history.map((h) => h.sell)} positive={historyPositive} />
                    <p className="text-xs text-white/45 mt-1">Giá bán ra · 30 ngày qua</p>
                  </div>
                )}

                <p className="text-xs text-white/45 mt-6">
                  Cập nhật gần nhất: {formatUpdated(primary.updateTime)}
                </p>
              </div>
            )}

            {/* Comparison list of other brands */}
            <div className="mt-5 md:mt-0 rounded-[28px] bg-white/10 backdrop-blur-md border border-white/10 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-4 py-3 text-xs text-white/50 border-b border-white/10">
                <span>Thương hiệu</span>
                <span className="text-right">Mua vào</span>
                <span className="text-right">Bán ra</span>
              </div>
              {others.map((item) => (
                <GoldRow key={item.code} item={item} />
              ))}
              {others.length === 0 && (
                <p className="text-sm text-white/50 px-4 py-4">
                  Không tải được giá các thương hiệu khác lúc này.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function GoldRow({ item }: { item: GoldItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center px-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-sm truncate pr-2">{item.label}</span>
      <span className="text-sm text-right font-medium tabular-nums">{formatVnd(item.buy)}</span>
      <span className="text-sm text-right font-medium tabular-nums">{formatVnd(item.sell)}</span>
    </div>
  );
}
