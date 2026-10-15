import { useId } from "react";

// Fixed scale: the same temperature always sits at the same height.
const SCALE_MIN = -10;
const SCALE_MAX = 110;

// Hard thresholds on the ACTUAL temperature.
const FREEZING_BELOW = 0;
const HOT_ABOVE = 100;

// Geometry (SVG units)
const CX = 80; // tube center x
const HALF = 18; // half the tube width
const TUBE_TOP = 40; // y of SCALE_MAX
const TUBE_BOTTOM = 240; // y of SCALE_MIN
const BULB_CY = 270;
const BULB_R = 30;
const FEELS_TIP = CX - HALF - 34;
const TEMP_TIP = CX + HALF + 34;

const LOW_COLOR = "#3b82f6";
const HIGH_COLOR = "#f97316";
const FEELS_COLOR = "#6b7280";

const THEMES = {
  normal: { outline: "#9ca3af", tint: "#f3f4f6", accent: "#374151", glow: null },
  freezing: { outline: "#38bdf8", tint: "#e0f2fe", accent: "#0284c7", glow: "#38bdf8" },
  hot: { outline: "#ea580c", tint: "#ffedd5", accent: "#ea580c", glow: "#f97316" },
};

// Single source of truth for vertical placement: bars, arrows, markers and ticks all use this.
function yFor(t) {
  const pct = Math.min(Math.max((t - SCALE_MIN) / (SCALE_MAX - SCALE_MIN), 0), 1);
  return TUBE_BOTTOM - pct * (TUBE_BOTTOM - TUBE_TOP);
}

function Thermometer({ temp, feelsLike, low, high }) {
  const uid = useId().replace(/:/g, "");

  if (![temp, feelsLike, low, high].every(Number.isFinite)) return null;

  const state = temp < FREEZING_BELOW ? "freezing" : temp > HOT_ABOVE ? "hot" : "normal";
  const theme = THEMES[state];

  // One continuous silhouette: tube sides run down to where they meet the bulb,
  // then the bulb's large arc closes the shape (no stray lines inside the bulb).
  const joinY = BULB_CY - Math.sqrt(BULB_R ** 2 - HALF ** 2);
  const tubePath =
    `M${CX - HALF},${joinY} V${TUBE_TOP} A${HALF},${HALF} 0 0 1 ${CX + HALF},${TUBE_TOP} ` +
    `V${joinY} A${BULB_R},${BULB_R} 0 1 1 ${CX - HALF},${joinY} Z`;

  const ticks = [];
  for (let tk = SCALE_MIN; tk <= SCALE_MAX; tk += 10) ticks.push(tk);

  const yLow = yFor(low);
  const yHigh = yFor(high);
  const yFeels = yFor(feelsLike);
  const yTemp = yFor(temp);

  const t = Math.round(temp);
  const f = Math.round(feelsLike);
  const lo = Math.round(low);
  const hi = Math.round(high);

  return (
    // The "hitbox": thermometer on the left 60%, readout on the right 40%.
    <div
      className="flex items-center w-full max-w-[420px] mx-auto"
      role="img"
      aria-label={`Temperature ${t}°F, feels like ${f}°F, low ${lo}°F, high ${hi}°F`}
    >
      {/* Left 60%: the drawing */}
      <div className="basis-[60%] min-w-0">
        <svg viewBox="0 0 160 310" className="w-full h-auto max-h-[240px]" aria-hidden="true">
          <style>{`
            @keyframes thermo-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
            @media (prefers-reduced-motion: no-preference) {
              .thermo-pulse { animation: thermo-pulse 2s ease-in-out infinite; }
            }
          `}</style>

          <defs>
            <clipPath id={`${uid}-clip`}>
              <path d={tubePath} />
            </clipPath>

            <filter id={`${uid}-glow`} x="-60%" y="-30%" width="220%" height="160%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          {/* Glow (only when freezing or hot) */}
          {theme.glow && (
            <g
              className={state === "hot" ? "thermo-pulse" : undefined}
              opacity="0.7"
              filter={`url(#${uid}-glow)`}
            >
              <path d={tubePath} fill={theme.glow} />
            </g>
          )}

          {/* Glass */}
          <path d={tubePath} fill={theme.tint} />

          {/* Fills, clipped to the glass silhouette.
              High is drawn first and low on top, so the visible orange band is the day's range. */}
          <g clipPath={`url(#${uid}-clip)`}>
            <rect x={CX - 12} y={yHigh} width="24" height={BULB_CY - yHigh} rx="3" fill={HIGH_COLOR} />
            <rect x={CX - 12} y={yLow} width="24" height={BULB_CY - yLow} rx="3" fill={LOW_COLOR} />
            <circle cx={CX} cy={BULB_CY} r={BULB_R - 8} fill={LOW_COLOR} />

            {/* Thin level markers so each arrow points at an exact height */}
            <line x1={CX - HALF} x2={CX + HALF} y1={yFeels} y2={yFeels} stroke="white" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8" />
            <line x1={CX - HALF} x2={CX + HALF} y1={yTemp} y2={yTemp} stroke="white" strokeWidth="2" />
          </g>

          {/* Glass outline */}
          <path d={tubePath} fill="none" stroke={theme.outline} strokeWidth="3" />

          {/* Ticks (every 10°, numbers every 20°) */}
          {ticks.map((tick) => {
            const y = yFor(tick);
            const len = tick % 20 === 0 ? 6 : 3;
            return (
              <g key={tick}>
                <line x1={CX - HALF - len} x2={CX - HALF} y1={y} y2={y} stroke={theme.outline} strokeWidth="1.5" />
                <line x1={CX + HALF} x2={CX + HALF + len} y1={y} y2={y} stroke={theme.outline} strokeWidth="1.5" />
              </g>
            );
          })}

          {/* Guide lines from arrow tips to the glass */}
          <line x1={FEELS_TIP} x2={CX - HALF} y1={yFeels} y2={yFeels} stroke={FEELS_COLOR} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
          <line x1={CX + HALF} x2={TEMP_TIP} y1={yTemp} y2={yTemp} stroke={theme.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />

          {/* Scale numbers (halo keeps the dashed guide from running through them) */}
          {ticks
            .filter((tick) => tick % 20 === 0)
            .map((tick) => (
              <text
                key={tick}
                x={CX - HALF - 10}
                y={yFor(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#9ca3af"
                stroke="white"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {tick}
              </text>
            ))}

          {/* Feels-like pointer (left) */}
          <polygon
            points={`${FEELS_TIP},${yFeels} ${FEELS_TIP - 12},${yFeels - 6} ${FEELS_TIP - 12},${yFeels + 6}`}
            fill={FEELS_COLOR}
          />

          {/* Actual-temp pointer (right) */}
          <polygon
            points={`${TEMP_TIP},${yTemp} ${TEMP_TIP + 12},${yTemp - 6} ${TEMP_TIP + 12},${yTemp + 6}`}
            fill={theme.accent}
          />
        </svg>
      </div>

      {/* Right 40%: the readout */}
      <div className="basis-[40%] min-w-0 pl-2">
        <p className="font-bold leading-none text-5xl" style={{ color: theme.accent }}>
          {t}°
          <span className="text-xl font-semibold align-top ml-0.5">F</span>
        </p>

        <p className="mt-3 flex items-center gap-1.5 text-sm" style={{ color: FEELS_COLOR }}>
          <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
            <polygon points="10,6 0,0 0,12" fill={FEELS_COLOR} />
          </svg>
          Feels like {f}°
        </p>

        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: HIGH_COLOR }}>
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: HIGH_COLOR }} />
          High {hi}°
        </p>

        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold" style={{ color: LOW_COLOR }}>
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: LOW_COLOR }} />
          Low {lo}°
        </p>
      </div>
    </div>
  );
}

export default Thermometer;