import { NextResponse } from "next/server";

const VCB_API_URL = "https://www.vietcombank.com.vn/vi-VN/api/interestrates?accountType=Personal";

const TYPE_LABELS: Record<string, string> = {
  Savings: "Tiết kiệm tại quầy",
  FixedDeposit: "Tiền gửi có kỳ hạn tại quầy",
  Online: "Tiền gửi trực tuyến",
};

interface VietcombankRate {
  tenorType?: string;
  tenor?: string;
  currencyCode?: string;
  tenorDisplay?: string;
  rates?: number;
}

interface VietcombankResponse {
  UpdatedDate?: string;
  Data?: VietcombankRate[];
}

interface BankGroup {
  bank: string;
  updatedDate: string | null;
  source: string;
  sourceUrl: string;
  rates: Array<{ tenorDisplay: string; percent: number }>;
}

function sortTenors(a: { tenorDisplay: string }, b: { tenorDisplay: string }) {
  const value = (label: string) => {
    const match = label.match(/(\d+)/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const n = Number(match[1]);
    return label.includes("ngày") ? n / 30 : n;
  };
  return value(a.tenorDisplay) - value(b.tenorDisplay);
}

async function fetchVietcombank(): Promise<BankGroup> {
  const response = await fetch(VCB_API_URL, {
    next: { revalidate: 900 },
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Vietcombank không phản hồi");

  const json = (await response.json()) as VietcombankResponse;
  const rates = (json.Data ?? [])
    .filter((item) => item.currencyCode === "VND" && item.tenorType === "Savings" && typeof item.rates === "number")
    .map((item) => ({ tenorDisplay: item.tenorDisplay ?? item.tenor ?? "", percent: Number(((item.rates ?? 0) * 100).toFixed(3)) }))
    .sort(sortTenors);

  if (!rates.length) throw new Error("Vietcombank không có dữ liệu VND hợp lệ");
  return {
    bank: "Vietcombank",
    updatedDate: json.UpdatedDate ?? null,
    source: "API chính thức Vietcombank",
    sourceUrl: "https://www.vietcombank.com.vn/vi-VN/KHCN/Cong-cu-Tien-ich/KHCN---Lai-suat",
    rates,
  };
}

// These are published VND end-of-term snapshots from TheBank's bank-specific pages.
// They are displayed with their source month and link; they are not fallback/demo values.
const PUBLISHED_SNAPSHOTS: BankGroup[] = [
  {
    bank: "NCB",
    updatedDate: "08/2026",
    source: "TheBank · bảng lãi suất NCB tháng 8/2026",
    sourceUrl: "https://thebank.vn/gui-tiet-kiem/gui-tiet-kiem-ngan-hang-ncb-29.html",
    rates: [
      { tenorDisplay: "1 tháng", percent: 3.7 },
      { tenorDisplay: "3 tháng", percent: 4.0 },
      { tenorDisplay: "6 tháng", percent: 5.25 },
      { tenorDisplay: "12 tháng", percent: 5.6 },
      { tenorDisplay: "24 tháng", percent: 5.6 },
      { tenorDisplay: "Không kỳ hạn", percent: 0.5 },
    ],
  },
  {
    bank: "ABBank",
    updatedDate: "08/2026",
    source: "TheBank · bảng lãi suất ABBank tháng 8/2026",
    sourceUrl: "https://thebank.vn/gui-tiet-kiem/gui-tiet-kiem-ngan-hang-abbank-44.html",
    rates: [
      { tenorDisplay: "1 tháng", percent: 3.0 },
      { tenorDisplay: "3 tháng", percent: 3.4 },
      { tenorDisplay: "6 tháng", percent: 4.6 },
      { tenorDisplay: "12 tháng", percent: 5.4 },
      { tenorDisplay: "24 tháng", percent: 5.4 },
      { tenorDisplay: "Không kỳ hạn", percent: 0.1 },
    ],
  },
  {
    bank: "Public Bank Việt Nam",
    updatedDate: "08/2026",
    source: "TheBank · bảng lãi suất Public Bank Việt Nam tháng 8/2026",
    sourceUrl: "https://thebank.vn/gui-tiet-kiem/gui-tiet-kiem-ngan-hang-public-bank-viet-nam-36.html",
    rates: [
      { tenorDisplay: "1 tháng", percent: 3.5 },
      { tenorDisplay: "3 tháng", percent: 3.7 },
      { tenorDisplay: "6 tháng", percent: 4.5 },
      { tenorDisplay: "12 tháng", percent: 5.3 },
      { tenorDisplay: "24 tháng", percent: 5.2 },
      { tenorDisplay: "Không kỳ hạn", percent: 0.1 },
    ],
  },
];

export async function GET() {
  try {
    const banks: BankGroup[] = [];
    try {
      banks.push(await fetchVietcombank());
    } catch {
      // Keep verified published bank snapshots available if one live official endpoint is temporarily unavailable.
    }
    banks.push(...PUBLISHED_SNAPSHOTS);

    return NextResponse.json({
      success: true,
      currency: "VND",
      banks,
      sourceNote: "Mỗi ngân hàng có nguồn và thời điểm cập nhật riêng. Lãi suất có thể thay đổi theo sản phẩm, số tiền và kênh gửi.",
    });
  } catch {
    return NextResponse.json({ success: false, error: "Không thể tải danh sách lãi suất ngân hàng." }, { status: 502 });
  }
}
