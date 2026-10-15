// OpenWeather's air pollution index: 1 (Good) to 5 (Very Poor).
const LEVELS = [
  { label: "Good", color: "#22c55e", numeral: "#16a34a", boxText: "#ffffff" },
  { label: "Fair", color: "#facc15", numeral: "#ca8a04", boxText: "#1f2937" }, // dark text: white fails on yellow
  { label: "Moderate", color: "#f97316", numeral: "#ea580c", boxText: "#ffffff" },
  { label: "Poor", color: "#ef4444", numeral: "#dc2626", boxText: "#ffffff" },
  { label: "Very Poor", color: "#991b1b", numeral: "#991b1b", boxText: "#ffffff" },
];

// Geometry (SVG units): a 180° arc split into one equal segment per level.
const CX = 100;
const CY = 100;
const R_OUT = 80;
const R_IN = 56;
const SEGMENT_DEG = 180 / LEVELS.length;

// Math-style angle (180° = left, 0° = right) to an SVG point.
function pointAt(deg, r) {
  const rad = (deg * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)];
}

function segmentPath(i) {
  const startDeg = 180 - i * SEGMENT_DEG;
  const endDeg = 180 - (i + 1) * SEGMENT_DEG;
  const [ox1, oy1] = pointAt(startDeg, R_OUT);
  const [ox2, oy2] = pointAt(endDeg, R_OUT);
  const [ix2, iy2] = pointAt(endDeg, R_IN);
  const [ix1, iy1] = pointAt(startDeg, R_IN);
  return (
    `M${ox1},${oy1} A${R_OUT},${R_OUT} 0 0 1 ${ox2},${oy2} ` +
    `L${ix2},${iy2} A${R_IN},${R_IN} 0 0 0 ${ix1},${iy1} Z`
  );
}

function AQIGauge({ aqi }) {
  const level = Math.round(aqi);
  if (!Number.isFinite(level) || level < 1 || level > LEVELS.length) return null;

  const current = LEVELS[level - 1];

  // Aim at the middle of the current level's segment.
  const needleDeg = 180 - ((level - 0.5) / LEVELS.length) * 180;
  const [nx, ny] = pointAt(needleDeg, R_OUT - 12);

  return (
    // Same "hitbox" structure as the thermometer: gauge on the left 60%, readout on the right 40%.
    <div
      className="flex items-center w-full max-w-[420px] mx-auto"
      role="img"
      aria-label={`Air quality ${level} of ${LEVELS.length}, ${current.label}`}
    >
      {/* Left 60%: the gauge */}
      <div className="basis-[60%] min-w-0">
        <svg viewBox="0 0 200 118" className="w-full h-auto" aria-hidden="true">
          {LEVELS.map((lvl, i) => (
            <path key={lvl.label} d={segmentPath(i)} fill={lvl.color} stroke="white" strokeWidth="2" />
          ))}

          {/* Level numbers just outside the arc */}
          {LEVELS.map((lvl, i) => {
            const [x, y] = pointAt(180 - (i + 0.5) * SEGMENT_DEG, R_OUT + 11);
            return (
              <text
                key={lvl.label}
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight={i + 1 === level ? "700" : "400"}
                fill={i + 1 === level ? "#374151" : "#9ca3af"}
              >
                {i + 1}
              </text>
            );
          })}

          {/* Needle */}
          <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
          <circle cx={CX} cy={CY} r="7" fill="#374151" />
          <circle cx={CX} cy={CY} r="2.5" fill="white" />
        </svg>
      </div>

      {/* Right 40%: the readout */}
      <div className="basis-[40%] min-w-0 pl-2">
        <p className="text-sm text-gray-500">Air Quality</p>

        <p className="font-bold leading-none text-5xl mt-1" style={{ color: current.numeral }}>
          {level}
          <span className="text-xl font-semibold text-gray-400 ml-0.5">/{LEVELS.length}</span>
        </p>

        <p
          className="inline-block mt-3 rounded-md px-3 py-1 text-sm font-semibold"
          style={{ backgroundColor: current.color, color: current.boxText }}
        >
          {current.label}
        </p>
      </div>
    </div>
  );
}

export default AQIGauge;