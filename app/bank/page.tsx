"use client";

import { useCallback, useEffect, useState } from "react";
import { BankGroup, BankRateData, fetchBankRates } from "@/lib/bank";

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(value)}%/năm`;
}

function BankCard({ bank }: { bank: BankGroup }) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/10 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-white">{bank.bank}</h2>
          <p className="mt-1 text-[11px] text-white/45">Cập nhật: {bank.updatedDate ?? "nguồn không cung cấp"}</p>
        </div>
        <a href={bank.sourceUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] text-amber-300 underline decoration-amber-300/40 underline-offset-4">
          Nguồn ↗
        </a>
      </div>
      <div className="grid grid-cols-3 gap-x-2 px-4 py-3 text-[11px] text-white/45">
        <span>Kỳ hạn</span>
        <span className="col-span-2 text-right">Lãi suất tiền gửi VND</span>
      </div>
      {bank.rates.map((rate) => (
        <div key={`${bank.bank}-${rate.tenorDisplay}`} className="grid grid-cols-3 items-center gap-x-2 border-t border-white/5 px-4 py-3">
          <span className="text-sm text-white/80">{rate.tenorDisplay}</span>
          <span className="col-span-2 text-right text-sm font-semibold tabular-nums text-amber-300">{formatPercent(rate.percent)}</span>
        </div>
      ))}
      <p className="border-t border-white/10 px-4 py-3 text-[11px] leading-5 text-white/35">{bank.source}</p>
    </section>
  );
}

export default function BankPage() {
  const [data, setData] = useState<BankRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await fetchBankRates());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải lãi suất ngân hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <main className="min-h-screen w-full bg-[linear-gradient(180deg,#071426_0%,#102c50_55%,#173d5a_100%)] text-white">
      <div className="mx-auto w-full max-w-md px-5 pb-28 pt-8 md:max-w-5xl md:px-0">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🏦</span>
          <div>
            <h1 className="font-display text-lg font-bold">Lãi suất ngân hàng</h1>
            <p className="text-sm text-white/60">Danh sách lãi suất tiền gửi VND</p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm text-white/70">Đang tải lãi suất...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-red-200/15 bg-red-950/20 px-6 py-24 text-center">
            <p className="text-white/80">{error}</p>
            <button onClick={load} className="rounded-full bg-white/15 px-4 py-2 text-sm transition-transform active:scale-95">Thử lại</button>
          </div>
        )}

        {!loading && !error && data && (
          <div className="animate-rise space-y-4">
            {data.banks.map((bank) => <BankCard key={bank.bank} bank={bank} />)}
            <p className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-[11px] leading-5 text-white/45">
              {data.sourceNote} Đây là thông tin tham khảo, không phải cam kết lãi suất; hãy kiểm tra lại tại ngân hàng trước khi gửi tiền.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
