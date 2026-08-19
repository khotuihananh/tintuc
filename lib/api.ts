import { CurrentWeather, DailyWeather, LocationResult, WeatherData } from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query.trim()) return [];
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=6&language=vi&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không tìm được địa điểm");
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `${REVERSE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=vi`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("reverse failed");
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || "Vị trí của bạn";
  } catch {
    return "Vị trí của bạn";
  }
}

export async function fetchWeather(
  lat: number,
  lon: number,
  locationName: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,is_day,precipitation_probability",
    hourly: "dew_point_2m,visibility,precipitation_probability",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Không thể tải dữ liệu thời tiết");
  const data = await res.json();

  const currentTime: string = data.current.time;
  const hourIndex = Math.max(0, data.hourly.time.indexOf(currentTime));

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    weatherCode: data.current.weather_code,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: data.current.wind_direction_10m,
    pressure: Math.round(data.current.pressure_msl),
    isDay: data.current.is_day === 1,
    dewPoint: Math.round(data.hourly.dew_point_2m[hourIndex] ?? 0),
    visibility: Math.round((data.hourly.visibility[hourIndex] ?? 0) / 1000),
    precipitationProbability: Math.round(
      data.current.precipitation_probability ??
        data.hourly.precipitation_probability[hourIndex] ??
        0
    ),
    time: currentTime,
  };

  const daily: DailyWeather[] = data.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    precipitationProbability: Math.round(data.daily.precipitation_probability_max[i] ?? 0),
  }));

  return {
    locationName,
    timezone: data.timezone,
    current,
    daily,
    lastUpdated: new Date().toISOString(),
  };
}

export function windDirectionToCompass(deg: number): string {
  const dirs = ["B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"];
  return dirs[Math.round(deg / 45) % 8];
}
