import { IconKey } from "@/lib/weatherCodes";

export default function WeatherIcon({
  icon,
  isDay = true,
  size = 96,
}: {
  icon: IconKey;
  isDay?: boolean;
  size?: number;
}) {
  const sunMoonColor = isDay ? "#ffc95c" : "#dfe6f2";
  const glow = isDay ? "rgba(255,201,92,0.55)" : "rgba(223,230,242,0.35)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sunGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff3d6" />
          <stop offset="55%" stopColor={sunMoonColor} />
          <stop offset="100%" stopColor="#f2a93c" />
        </radialGradient>
        <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dfe6ef" />
        </linearGradient>
        <linearGradient id="cloudGradDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aeb9c9" />
          <stop offset="100%" stopColor="#8b96a8" />
        </linearGradient>
      </defs>

      {(icon === "clear" || icon === "partly") && (
        <circle
          cx={icon === "clear" ? 50 : 40}
          cy={icon === "clear" ? 50 : 38}
          r="22"
          fill="url(#sunGrad)"
          className="animate-pulseGlow"
          style={{ filter: `drop-shadow(0 0 14px ${glow})`, transformOrigin: "center" }}
        />
      )}

      {icon === "fog" && (
        <g className="animate-drift" style={{ transformOrigin: "center" }}>
          {[38, 50, 62, 74].map((y, i) => (
            <rect key={y} x={16 + (i % 2) * 6} y={y} width={68 - (i % 2) * 12} height="6" rx="3" fill="#e7edf3" opacity={0.85 - i * 0.1} />
          ))}
        </g>
      )}

      {(icon === "cloudy" || icon === "partly" || icon === "drizzle" || icon === "rain" || icon === "sleet" || icon === "storm" || icon === "snow") && (
        <g className="animate-drift" style={{ transformOrigin: "center" }}>
          <ellipse cx="46" cy="58" rx="26" ry="16" fill="url(#cloudGrad)" />
          <ellipse cx="66" cy="54" rx="17" ry="13" fill="url(#cloudGrad)" />
          <ellipse cx="30" cy="54" rx="15" ry="11" fill="url(#cloudGradDark)" opacity="0.9" />
        </g>
      )}

      {icon === "storm" && (
        <polygon
          points="52,64 42,82 50,82 44,96 62,76 53,76 60,64"
          fill="#ffd447"
          className="animate-pulseGlow"
        />
      )}

      {(icon === "drizzle" || icon === "rain" || icon === "sleet") && (
        <g>
          {[34, 48, 62].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1="72"
              x2={x - 5}
              y2="88"
              stroke="#bcdcff"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-fall"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </g>
      )}

      {icon === "snow" && (
        <g>
          {[34, 48, 62].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy="80"
              r="2.6"
              fill="#ffffff"
              className="animate-fall"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
