export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  isDay: boolean;
  dewPoint: number;
  visibility: number;
  precipitationProbability: number;
  time: string;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
}

export interface WeatherData {
  locationName: string;
  timezone: string;
  current: CurrentWeather;
  daily: DailyWeather[];
  lastUpdated: string;
}

export interface LocationResult {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}
