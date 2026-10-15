import { useState, useEffect } from "react";
import WeatherCard from "./WeatherCard";

const HOUR = 3600;
const DAY = 86400;

const SKY = {
  night: { top: [11, 16, 38], bottom: [30, 27, 75] },
  dawn: { top: [91, 123, 181], bottom: [245, 158, 107] },
  day: { top: [74, 144, 217], bottom: [191, 224, 247] },
  dusk: { top: [109, 76, 143], bottom: [240, 138, 75] },
};

const mix = (c1, c2, f) => c1.map((v, i) => Math.round(v + (c2[i] - v) * f));
const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

function skyAt(now, rise, set) {
  const frames = [
    [rise, SKY.dawn],
    [rise + HOUR, SKY.day],
    [set - HOUR, SKY.day],
    [set, SKY.dusk],
    [set + HOUR, SKY.night],
    [rise + DAY - HOUR, SKY.night],
    [rise + DAY, SKY.dawn],
  ];
 
  for (let i = 0; i < frames.length - 1; i++) {
    const [t0, c0] = frames[i];
    const [t1, c1] = frames[i + 1];
    if (now >= t0 && now < t1) {
      const f = (now - t0) / (t1 - t0);
      return { top: mix(c0.top, c1.top, f), bottom: mix(c0.bottom, c1.bottom, f) };
    }
  }
  return SKY.night;
}

const P0 = [20, 100];
const P1 = [100, -20];
const P2 = [180, 100];
 
function arcPoint(t) {
  const u = 1 - t;
  return [
    u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0],
    u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1],
  ];
}

const cityTime = (ts, tzOffset) =>
  new Date((ts + tzOffset) * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });

const cityDate = (ts, tzOffset) =>
  new Date((ts + tzOffset) * 1000).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

function Header({ weather }) {
  const [now, setNow] = useState(() => Date.now() / 1000);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() / 1000), 60000);
    return () => clearInterval(id);
  }, []);

  if (!weather) return null;

  const { sunrise, sunset } = weather.sys || {};
  const caption = weather.weather[0].description;
  const tz = weather.timezone || 0;

  const heading = (
    <div>
      <h2 className="text-xl font-semibold leading-tight">{weather.name}</h2>
      <p className="text-xs opacity-75 mt-0.5">
        {cityDate(now, tz)}
      </p>
    </div>
  );
  
  if (!sunrise || !sunset || sunset <= sunrise) {
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        {heading}
        <WeatherCard weather={weather} caption={caption} className="bg-gray-700 rounded-2xl p-6 text-lg min-w-[200px]" />
      </div>
    );
  }
  
  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

  const shift = Math.floor((now - sunrise) / DAY) * DAY;
  const rise = sunrise + shift;
  const set = sunset + shift;
 
  const isDay = now < set;
  const progress = isDay
    ? (now - rise) / (set - rise)
    : (now - set) / (rise + DAY - set);
  const t = Math.min(Math.max(progress, 0), 1);
  const [px, py] = arcPoint(t);
 
  const sky = skyAt(now, rise, set);
  const mid = mix(sky.top, sky.bottom, 0.5);
  const brightness = (0.299 * mid[0] + 0.587 * mid[1] + 0.114 * mid[2]) / 255;
  const lightSky = brightness > 0.6;
  const textColor = lightSky ? "#1f2937" : "#f9fafb";
  const arcStroke = lightSky ? "rgba(31, 41, 55, 0.45)" : "rgba(249, 250, 251, 0.55)";

  const left = isDay ? { label: "Sunrise", ts: rise } : { label: "Sunset", ts: set };
  const right = isDay ? { label: "Sunset", ts: set } : { label: "Sunrise", ts: rise + DAY };
 
  return (
    <div
      className="relative overflow-hidden rounded-xl shadow flex flex-col"
      style={{
        background: `linear-gradient(to bottom, ${rgb(sky.top)}, ${rgb(sky.bottom)})`,
        color: textColor,
      }}
    >
      <div className="p-4 pb-0">{heading}</div>
 
      <div className="text-center pt-2">
          <p className="text-3xl font-bold tracking-tight">
              {cityTime(now, tz)}
          </p>
      </div>
      <div className="text-center px-4 pt-3">
        <p className="text-6xl font-light tracking-tight leading-none drop-shadow-sm">
          {Math.round(weather.main.temp)}
          <span className="text-3xl font-normal align-top ml-1">°F</span>
        </p>
        <p className="mt-2 text-base font-medium capitalize tracking-wide opacity-90">{caption}</p>
      </div>

      <div className="relative mt-auto">
        <svg
          viewBox="0 30 200 80"
          className="w-full h-auto block"
          role="img"
          aria-label={`${isDay ? "Sun" : "Moon"} ${Math.round(t * 100)}% of the way from ${left.label.toLowerCase()} to ${right.label.toLowerCase()}`}
        >
          <line x1={P0[0]} x2={P2[0]} y1={P0[1]} y2={P2[1]} stroke={arcStroke} strokeWidth="1" opacity="0.6" />
          <path
            d={`M${P0[0]},${P0[1]} Q${P1[0]},${P1[1]} ${P2[0]},${P2[1]}`}
            fill="none"
            stroke={arcStroke}
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          {isDay ? (
            <circle cx={px} cy={py} r="6" fill="#fbbf24" stroke="#fde68a" strokeWidth="2" />
          ) : (
            <circle cx={px} cy={py} r="5.5" fill="#e5e7eb" stroke="#cbd5e1" strokeWidth="1.5" />
          )}
        </svg>
 
        <div
          className="absolute left-1/2 -translate-x-1/2
                    bottom-[14%] w-28 h-28
                    flex items-center justify-center"
        >
          <img
            src={iconUrl}
            alt={caption}
            className="w-28 h-28 object-contain drop-shadow-md"
          />
        </div>
      </div>

      <div className="relative pt-2 pb-3 min-h-[3.5rem]">
        <div className="absolute top-2 -translate-x-1/2 text-center text-xs" style={{ left: "10%" }}>
          <p className="opacity-70">{left.label}</p>
          <p className="font-semibold">{cityTime(left.ts, tz)}</p>
        </div>
        <div className="absolute top-2 translate-x-1/2 text-center text-xs" style={{ right: "10%" }}>
          <p className="opacity-70">{right.label}</p>
          <p className="font-semibold">{cityTime(right.ts, tz)}</p>
        </div>
      </div>
    </div>
  );

}

function StatsGrid({ weather, hourlyData }){
  if (!weather) return null;

  const tempC = (weather.main.temp - 32) * 5/9;
  const dewPointC = tempC - ((100 - weather.main.humidity) / 5);
  const dewPoint = (dewPointC * (9/5)) + 32;

  const pressureInHg = (weather.main.pressure * 0.02953).toFixed(2);
  const nextPressure = hourlyData?.[2]?.main?.pressure;
  const pressureDiff = nextPressure != null ? nextPressure - weather.main.pressure : null;
  const pressureIndicator = 
    pressureDiff == null ? "" :
    pressureDiff >= 2 ? "↑ Rising" :
    pressureDiff <= -2 ? "↓ Falling" :
    "-- Steady";

  const visMiles = weather.visibility != null ? weather.visibility / 1609.34 : null;
  const visCapped = weather.visibility >= 10000;
  const visIndex =
    visMiles == null ? "" :
    visMiles < 1 ? "Poor" :
    visMiles < 3 ? "Reduced" :
    visMiles < 6 ? "Moderate" :
    "Clear";

  const humidityIndex = weather.main.humidity < 30 ? "Dry" : weather.main.humidity <= 60 ? "Comfortable" : "Humid";

  const dewIndex =
    dewPoint < 50 ? "Dry" :
    dewPoint < 60 ? "Comfortable" :
    dewPoint < 65 ? "Slightly humid" :
    dewPoint < 70 ? "Sticky" :
    "Oppressive";

  const stats = [
    { label: "Humidity", value: weather.main.humidity, unit: "%", note: humidityIndex, bar: weather.main.humidity },
    { label: "Pressure", value: pressureInHg, unit: "inHg", note: pressureIndicator },
    {
      label: "Visibility",
      value: visMiles != null ? `${visMiles.toFixed(1)}${visCapped ? "+" : ""}` : "—",
      unit: visMiles != null ? "mi" : "",
      note: visIndex,
    },
    { label: "Dew Point", value: dewPoint.toFixed(2), unit: "°F", note: dewIndex },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl bg-gray-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500">{stat.label}</p>
          <p className="text-xl font-bold text-gray-800">
            {stat.value}
            <span className="text-xs font-semibold text-gray-500 ml-1">{stat.unit}</span>
          </p>
          {stat.bar != null && (
            <div className="h-1.5 w-full rounded-full bg-gray-200 mt-1">
              <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${stat.bar}%` }} />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">{stat.note}</p>
        </div>
      ))}
    </div>
  )
}

export { StatsGrid };
export default Header;