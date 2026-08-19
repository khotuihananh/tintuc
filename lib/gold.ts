export interface GoldItem {
  code: string;
  label: string;
  buy: number;
  sell: number;
  changeBuy: number;
  changeSell: number;
  updateTime: number;
}

export interface GoldHistoryPoint {
  time: number;
  buy: number;
  sell: number;
}

export interface GoldData {
  items: GoldItem[];
  history: GoldHistoryPoint[];
  currentTime: number;
}

export const PRIMARY_CODE = "SJL1L10";

// Calls our own Next.js API route (app/api/gold/route.ts), which fetches
// vang.today server-side. Same-origin call from the browser — never subject
// to third-party CORS restrictions.
export async function fetchGoldData(): Promise<GoldData> {
  const res = await fetch("/api/gold");
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? "Không thể tải dữ liệu giá vàng");
  }
  return {
    items: json.items,
    history: json.history ?? [],
    currentTime: json.currentTime,
  };
}
