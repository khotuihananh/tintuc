export interface BtcData {
  priceUsd: number;
  priceVnd: number;
  change24hPct: number;
  marketCapUsd: number;
  marketCapVnd: number;
  volumeUsd: number;
  volumeVnd: number;
  high24hUsd: number;
  low24hUsd: number;
  athUsd: number;
  athChangePct: number;
  sparkline: number[];
  lastUpdated: string;
}

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true";

export async function fetchBtcData(): Promise<BtcData> {
  const res = await fetch(COINGECKO_URL);
  if (!res.ok) throw new Error("Không thể tải dữ liệu Bitcoin");
  const data = await res.json();
  const md = data.market_data;

  return {
    priceUsd: md.current_price.usd,
    priceVnd: md.current_price.vnd,
    change24hPct: md.price_change_percentage_24h ?? 0,
    marketCapUsd: md.market_cap.usd,
    marketCapVnd: md.market_cap.vnd,
    volumeUsd: md.total_volume.usd,
    volumeVnd: md.total_volume.vnd,
    high24hUsd: md.high_24h.usd,
    low24hUsd: md.low_24h.usd,
    athUsd: md.ath.usd,
    athChangePct: md.ath_change_percentage.usd,
    sparkline: md.sparkline_7d?.price ?? [],
    lastUpdated: md.last_updated,
  };
}
