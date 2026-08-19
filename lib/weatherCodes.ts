export type IconKey =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "sleet"
  | "snow"
  | "storm";

export interface WeatherMeta {
  label: string;
  icon: IconKey;
}

// WMO Weather interpretation codes (used by Open-Meteo)
const CODE_MAP: Record<number, WeatherMeta> = {
  0: { label: "Trời trong", icon: "clear" },
  1: { label: "Quang đãng", icon: "partly" },
  2: { label: "Có mây rải rác", icon: "partly" },
  3: { label: "Nhiều mây", icon: "cloudy" },
  45: { label: "Sương mù", icon: "fog" },
  48: { label: "Sương mù đóng băng", icon: "fog" },
  51: { label: "Mưa phùn nhẹ", icon: "drizzle" },
  53: { label: "Mưa phùn", icon: "drizzle" },
  55: { label: "Mưa phùn dày", icon: "drizzle" },
  56: { label: "Mưa phùn đóng băng", icon: "drizzle" },
  57: { label: "Mưa phùn đóng băng dày", icon: "drizzle" },
  61: { label: "Mưa nhẹ", icon: "rain" },
  63: { label: "Mưa vừa", icon: "rain" },
  65: { label: "Mưa to", icon: "rain" },
  66: { label: "Mưa đóng băng nhẹ", icon: "sleet" },
  67: { label: "Mưa đóng băng to", icon: "sleet" },
  71: { label: "Tuyết rơi nhẹ", icon: "snow" },
  73: { label: "Tuyết rơi vừa", icon: "snow" },
  75: { label: "Tuyết rơi dày", icon: "snow" },
  77: { label: "Hạt tuyết", icon: "snow" },
  80: { label: "Mưa rào nhẹ", icon: "rain" },
  81: { label: "Mưa rào vừa", icon: "rain" },
  82: { label: "Mưa rào dữ dội", icon: "rain" },
  85: { label: "Mưa tuyết rào nhẹ", icon: "sleet" },
  86: { label: "Mưa tuyết rào dày", icon: "sleet" },
  95: { label: "Dông", icon: "storm" },
  96: { label: "Dông kèm mưa đá nhẹ", icon: "storm" },
  99: { label: "Dông kèm mưa đá to", icon: "storm" },
};

export function getWeatherMeta(code: number): WeatherMeta {
  return CODE_MAP[code] ?? { label: "Không xác định", icon: "cloudy" };
}

// Sky gradient "mood" — the signature visual element of the app.
// Combines the weather icon category with day/night to pick a gradient.
export function getSkyGradient(icon: IconKey, isDay: boolean): string {
  if (!isDay) {
    switch (icon) {
      case "clear":
      case "partly":
        return "linear-gradient(180deg,#040b1f 0%,#0b1c3f 45%,#132a52 100%)";
      case "storm":
        return "linear-gradient(180deg,#05060d 0%,#141227 50%,#1b1c33 100%)";
      case "rain":
      case "drizzle":
      case "sleet":
        return "linear-gradient(180deg,#040c18 0%,#0d1e33 50%,#16293e 100%)";
      case "snow":
        return "linear-gradient(180deg,#0a1526 0%,#182c46 50%,#233752 100%)";
      default:
        return "linear-gradient(180deg,#0a1220 0%,#16233a 50%,#1e2c44 100%)";
    }
  }
  switch (icon) {
    case "clear":
      return "linear-gradient(180deg,#1c69c4 0%,#2f7fd6 40%,#5aa4e6 100%)";
    case "partly":
      return "linear-gradient(180deg,#2c66a8 0%,#3d7cb9 45%,#6c9bc4 100%)";
    case "cloudy":
    case "fog":
      return "linear-gradient(180deg,#4a5b73 0%,#5c6f86 45%,#7c8ca0 100%)";
    case "storm":
      return "linear-gradient(180deg,#20293b 0%,#2f394e 50%,#454f63 100%)";
    case "rain":
    case "drizzle":
    case "sleet":
      return "linear-gradient(180deg,#2b3c56 0%,#33475f 45%,#4a5e75 100%)";
    case "snow":
      return "linear-gradient(180deg,#7891a8 0%,#8ba3b8 45%,#a9bdcd 100%)";
    default:
      return "linear-gradient(180deg,#1c69c4 0%,#2f7fd6 40%,#5aa4e6 100%)";
  }
}
