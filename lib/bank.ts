export interface BankRate {
  tenorDisplay: string;
  percent: number;
}

export interface BankGroup {
  bank: string;
  updatedDate: string | null;
  source: string;
  sourceUrl: string;
  rates: BankRate[];
}

export interface BankRateData {
  currency: string;
  banks: BankGroup[];
  sourceNote: string;
}

export async function fetchBankRates(): Promise<BankRateData> {
  const response = await fetch("/api/bank-rates");
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? "Không thể tải lãi suất ngân hàng.");
  }
  return json as BankRateData;
}
