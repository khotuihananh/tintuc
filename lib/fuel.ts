export interface FuelItem {
  name: string;
  region1: number;
  region2: number;
}

export interface FuelHistoryEntry {
  date: string;
  unit: string;
  items: FuelItem[];
}

export interface FuelData {
  items: FuelItem[];
  date: string; // DD/MM/YYYY — date this price bracket took effect
  unit: string;
  history: FuelHistoryEntry[];
}

const FUEL_JSON_URL = "https://raw.githubusercontent.com/toanqng/fuel/main/fuel-vietnam.json";

// The dataset stores VND amounts as Vietnamese-formatted strings, e.g. "24.970" = 24970.
function parseVndNumber(s: string): number {
  return parseInt(s.replace(/\./g, ""), 10);
}

function normalizeItems(list: Array<{ name: string; region1: string; region2: string }>): FuelItem[] {
  return list
    .filter((i) => i.region1)
    .map((i) => ({
      name: i.name,
      region1: parseVndNumber(i.region1),
      region2: i.region2 ? parseVndNumber(i.region2) : parseVndNumber(i.region1),
    }));
}

export async function fetchFuelData(): Promise<FuelData> {
  const res = await fetch(FUEL_JSON_URL);
  if (!res.ok) throw new Error("Không thể tải dữ liệu giá xăng dầu");
  const history: Array<{
    date: string;
    unit: string;
    list: Array<{ name: string; region1: string; region2: string }>;
  }> = await res.json();

  if (!Array.isArray(history) || history.length === 0) {
    throw new Error("Không thể tải dữ liệu giá xăng dầu");
  }

  const normalizedHistory: FuelHistoryEntry[] = history.map((entry) => ({
    date: entry.date,
    unit: entry.unit,
    items: normalizeItems(entry.list ?? []),
  }));
  const latest = normalizedHistory[0];

  return { items: latest.items, date: latest.date, unit: latest.unit, history: normalizedHistory };
}

export function pickFeatured(items: FuelItem[]): FuelItem | undefined {
  return items.find((i) => i.name.includes("RON 95-V")) ?? items[0];
}
