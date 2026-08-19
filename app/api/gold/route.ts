import { NextResponse } from "next/server";

const LABELS: Record<string, string> = {
  SJL1L10: "SJC 9999 (miếng)",
  SJ9999: "Nhẫn trơn SJC",
  DOHNL: "DOJI Hà Nội",
  DOHCML: "DOJI TP.HCM",
  DOJINHTV: "Nhẫn trang sức DOJI",
  BTSJC: "Bảo Tín SJC",
  BT9999NTT: "Bảo Tín 9999",
  PQHNVM: "PNJ Hà Nội",
  PQHN24NTT: "PNJ 24K",
  VNGSJC: "VN Gold SJC",
  VIETTINMSJC: "Viettin SJC",
};

const PRIMARY_CODE = "SJL1L10";
const BASE_URL = "https://www.vang.today/api/prices";

// Real response shape (confirmed via curl), flat object — NOT the
// {success, data:[...]} shape shown in vang.today's own docs:
// { time: "10:00", date: "2026-08-19", type, name, buy, sell, change_buy, change_sell }
function toUnixTime(date?: string, time?: string): number {
  if (!date) return Math.floor(Date.now() / 1000);
  const iso = `${date}T${time ?? "00:00"}:00+07:00`; // Vietnam time
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.floor(t / 1000) : Math.floor(Date.now() / 1000);
}

async function fetchOneType(code: string) {
  try {
    const res = await fetch(`${BASE_URL}?type=${code}`, {
      next: { revalidate: 240 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const item = await res.json();
    if (!item || typeof item.buy !== "number" || typeof item.sell !== "number") return null;
    return {
      code,
      label: LABELS[code] ?? item.name ?? code,
      buy: item.buy,
      sell: item.sell,
      changeBuy: item.change_buy ?? 0,
      changeSell: item.change_sell ?? 0,
      updateTime: toUnixTime(item.date, item.time),
    };
  } catch {
    return null;
  }
}

async function fetchHistory() {
  try {
    const res = await fetch(`${BASE_URL}?type=${PRIMARY_CODE}&days=30`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();

    // Defensive: accept a raw array, or {data: [...]}, or a single flat object.
    const list: any[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [json];

    return list
      .filter((d) => d && typeof d.buy === "number" && typeof d.sell === "number")
      .map((d) => ({ time: toUnixTime(d.date, d.time), buy: d.buy, sell: d.sell }))
      .sort((a, b) => a.time - b.time);
  } catch {
    return [];
  }
}

export async function GET() {
  const codes = Object.keys(LABELS);
  const [results, history] = await Promise.all([
    Promise.all(codes.map(fetchOneType)),
    fetchHistory(),
  ]);

  const items = results.filter(Boolean);

  if (items.length === 0) {
    return NextResponse.json(
      { success: false, error: "Không thể tải dữ liệu giá vàng từ nguồn." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    items,
    history,
    currentTime: Math.floor(Date.now() / 1000),
  });
}
