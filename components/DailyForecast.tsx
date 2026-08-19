"use client";

import { DailyWeather } from "@/lib/types";
import { getWeatherMeta } from "@/lib/weatherCodes";
import WeatherIcon from "./WeatherIcon";

const TRACK_HEIGHT = 96;

function weekdayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(d).toUpperCase();
}

function dayMonthLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function DailyForecast({ days }: { days: DailyWeather[] }) {
  const globalMax = Math.max(...days.map((d) => d.tempMax));
  const globalMin = Math.min(...days.map((d) => d.tempMin));
  const span = Math.max(1, globalMax - globalMin);

  return (
    <section className="rounded-t-[28px] md:rounded-[32px] md:h-full bg-[#0c2140]/80 backdrop-blur-md border md:border-white/15 px-4 pt-5 pb-8 md:p-7 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] md:shadow-2xl">
      <div className="flex items-center justify-between mb-4 px-1 md:px-0">
        <h2 className="font-display font-bold text-lg">Dự báo hằng ngày</h2>
        <span className="text-xs text-white/50">Nguồn: Open-Meteo</span>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x px-1 pb-1 md:grid md:grid-cols-7 md:gap-2 md:overflow-visible md:px-0">
        {days.map((day, i) => {
          const meta = getWeatherMeta(day.weatherCode);
          const topPct = (globalMax - day.tempMax) / span;
          const bottomPct = (globalMax - day.tempMin) / span;
          let top = topPct * TRACK_HEIGHT;
          let bottom = bottomPct * TRACK_HEIGHT;
          if (bottom - top < 22) {
            const mid = (top + bottom) / 2;
            top = mid - 11;
            bottom = mid + 11;
          }
          const isToday = i === 0;

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center shrink-0 w-[74px] md:w-full md:shrink snap-start rounded-2xl py-3 ${
                isToday ? "bg-amber-400/90 text-[#3a2400]" : "text-white"
              }`}
            >
              <div className={`text-[11px] font-bold leading-tight text-center ${isToday ? "" : "text-white/85"}`}>
                {isToday ? "HÔM NAY" : weekdayLabel(day.date)}
              </div>
              <div className={`text-xs mt-0.5 ${isToday ? "text-[#3a2400]/80" : "text-white/55"}`}>
                {dayMonthLabel(day.date)}
              </div>

              <div className="my-2">
                <WeatherIcon icon={meta.icon} isDay size={40} />
              </div>

              <div className={`flex items-center gap-0.5 text-xs mb-2 ${isToday ? "text-[#3a2400]/90" : "text-sky-300"}`}>
                <span aria-hidden>💧</span>
                <span>{day.precipitationProbability}%</span>
              </div>

              <div className="w-full flex flex-col items-center">
                <span className="text-xs font-semibold">{day.tempMax}°</span>
                <div className="relative w-1.5 mt-1" style={{ height: TRACK_HEIGHT }}>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 border-t border-dashed border-white/25"
                    style={{ top: 0, width: 34 }}
                  />
                  <div
                    className="absolute left-0 right-0 rounded-full w-1.5"
                    style={{
                      top,
                      height: Math.max(22, bottom - top),
                      background: isToday
                        ? "linear-gradient(180deg,#7a5a00,#c99a1c)"
                        : "linear-gradient(180deg,#e7c95c,#5fb0e0)",
                    }}
                  />
                </div>
                <span className={`text-xs mt-1 ${isToday ? "text-[#3a2400]/70" : "text-white/60"}`}>
                  {day.tempMin}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
