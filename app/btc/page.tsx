"use client";

import { useCallback, useEffect, useState } from "react";
import { BtcData, fetchBtcData } from "@/lib/btc";
import Sparkline from "@/components/Sparkline";

type Currency = "usd" | "vnd";

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCompactUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatCompactVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatUpdated(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "vừa xong";
  if (mins === 1) return "1 phút trước";
  return `${mins} phút trước`;
}

export default function BtcPage() {
  const [data, setData] = useState<BtcData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>("usd");

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await fetchBtcData();
      setData(d);
    } catch {
      setError("Không thể tải dữ liệu Bitcoin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const positive = (data?.change24hPct ?? 0) >= 0;
  const bg =
    loading || error
      ? "linear-gradient(180deg,#141a26 0%,#1b2333 100%)"
      : positive
      ? "linear-gradient(180deg,#231a06 0%,#3a2705 45%,#4d3407 100%)"
      : "linear-gradient(180deg,#230c0c 0%,#3a1313 45%,#4d1818 100%)";

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center transition-[background] duration-700"
      style={{ background: bg }}
    >
      <div className="w-full max-w-md md:max-w-5xl px-5 md:px-0 pt-8 pb-28">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden>₿</span>
          <h1 className="font-display font-bold text-lg">Giá Bitcoin</h1>
        </div>
        <p className="text-sm text-white/60 mb-6">Dữ liệu trực tiếp từ CoinGecko</p>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <p className="text-white/70 text-sm">Đang tải giá Bitcoin...</p>
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
          <div className="animate-rise md:grid md:grid-cols-[1fr_340px] md:gap-6 md:items-start">
            {/* Price + chart panel */}
            <div className="md:bg-white/10 md:backdrop-blur-xl md:rounded-[32px] md:border md:border-white/15 md:p-7 md:shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex bg-white/10 rounded-full p-1 text-xs">
                  <button
                    onClick={() => setCurrency("usd")}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      currency === "usd" ? "bg-white/25 font-semibold" : "text-white/60"
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrency("vnd")}
                    className={`px-3 py-1.5 rounded-full transition-colors ${
                      currency === "vnd" ? "bg-white/25 font-semibold" : "text-white/60"
                    }`}
                  >
                    VND
                  </button>
                </div>
                <span
                  className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                    positive ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"
                  }`}
                >
                  {positive ? "▲" : "▼"} {Math.abs(data.change24hPct).toFixed(2)}% (24h)
                </span>
              </div>

              <div
                className="font-display font-light tracking-tight mt-5"
                style={{ fontSize: currency === "usd" ? 52 : 36, lineHeight: 1 }}
              >
                {currency === "usd" ? formatUsd(data.priceUsd) : formatVnd(data.priceVnd)}
              </div>

              <div className="mt-6 -mx-1">
                <Sparkline data={data.sparkline} positive={positive} />
              </div>
              <p className="text-xs text-white/45 mt-1">Biến động 7 ngày qua</p>

              <p className="text-xs text-white/45 mt-6">
                Cập nhật gần nhất: {formatUpdated(data.lastUpdated)}
              </p>
            </div>

            {/* Stats panel */}
            <div className="mt-5 md:mt-0 grid grid-cols-2 gap-3">
              <StatCard
                label="Vốn hóa thị trường"
                value={currency === "usd" ? formatCompactUsd(data.marketCapUsd) : formatCompactVnd(data.marketCapVnd)}
              />
              <StatCard
                label="Khối lượng 24h"
                value={currency === "usd" ? formatCompactUsd(data.volumeUsd) : formatCompactVnd(data.volumeVnd)}
              />
              <StatCard label="Cao nhất 24h" value={formatUsd(data.high24hUsd)} />
              <StatCard label="Thấp nhất 24h" value={formatUsd(data.low24hUsd)} />
              <StatCard
                label="Đỉnh mọi thời đại"
                value={formatUsd(data.athUsd)}
                sub={`${data.athChangePct.toFixed(1)}% so với đỉnh`}
                className="col-span-2"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`bg-white/10 border border-white/10 rounded-2xl px-4 py-3 ${className}`}>
      <p className="text-xs text-white/55">{label}</p>
      <p className="font-semibold mt-0.5">{value}</p>
      {sub && <p className="text-xs text-white/45 mt-0.5">{sub}</p>}
    </div>
  );
}
