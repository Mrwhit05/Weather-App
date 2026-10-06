const TEMPERATURE_THRESHOLDS = {
  noticeable: { threeHourChangeF: 8, sixHourChangeF: 12 },
  sharp: { threeHourChangeF: 12, sixHourChangeF: 18 },
  major: { sixHourChangeF: 20 },
  feelsLikeAmplifierF: 5,
};

function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPriority(changeF, periodHours) {
  const magnitude = Math.abs(changeF);
  if (periodHours === 6 && magnitude >= TEMPERATURE_THRESHOLDS.major.sixHourChangeF) return "high";
  if ((periodHours === 3 && magnitude >= TEMPERATURE_THRESHOLDS.sharp.threeHourChangeF) ||
    (periodHours === 6 && magnitude >= TEMPERATURE_THRESHOLDS.sharp.sixHourChangeF)) return "medium";
  return "low";
}

export function findTemperatureTrends(hourlyData) {
  if (!hourlyData?.length) return [];

  const candidates = [];
  for (let index = 1; index < hourlyData.length; index += 1) {
    const current = hourlyData[index];
    const threeHourChangeF = current.main.temp - hourlyData[index - 1].main.temp;
    if (Math.abs(threeHourChangeF) >= TEMPERATURE_THRESHOLDS.noticeable.threeHourChangeF) {
      candidates.push({ start: hourlyData[index - 1], current, changeF: threeHourChangeF, periodHours: 3 });
    }
    if (index >= 2) {
      const sixHourChangeF = current.main.temp - hourlyData[index - 2].main.temp;
      if (Math.abs(sixHourChangeF) >= TEMPERATURE_THRESHOLDS.noticeable.sixHourChangeF) {
        candidates.push({ start: hourlyData[index - 2], current, changeF: sixHourChangeF, periodHours: 6 });
      }
    }
  }
  if (!candidates.length) return [];

  const strongest = candidates.reduce((largest, candidate) =>
    Math.abs(candidate.changeF) > Math.abs(largest.changeF) ? candidate : largest
  );
  const feelsLikeChangeF = strongest.start ?
    strongest.current.main.feels_like - strongest.start.main.feels_like : null;
  const amplifiedByFeelsLike = feelsLikeChangeF != null &&
    Math.abs(feelsLikeChangeF) >= Math.abs(strongest.changeF) + TEMPERATURE_THRESHOLDS.feelsLikeAmplifierF;

  return [{
    id: `temperature-swing-${strongest.current.dt}`,
    category: "temperature",
    priority: getPriority(strongest.changeF, strongest.periodHours),
    title: strongest.changeF > 0 ? "Plan for a warmer stretch" : "Bring a layer for later",
    message: strongest.changeF > 0
      ? `Temperatures should build between ${formatTime(strongest.start.dt)} and ${formatTime(strongest.current.dt)}, ` +
        "so lighter clothing may feel more comfortable later." +
        (amplifiedByFeelsLike ? " It may feel warmer than the thermometer suggests." : "")
      : `Temperatures should ease off between ${formatTime(strongest.start.dt)} and ${formatTime(strongest.current.dt)}. ` +
        "An extra layer may make outdoor plans more comfortable." +
        (amplifiedByFeelsLike ? " The chill may feel more noticeable than the temperature suggests." : ""),
    startsAt: strongest.current.dt - strongest.periodHours * 3600,
    endsAt: strongest.current.dt,
    evidence: { changeF: strongest.changeF, feelsLikeChangeF, periodHours: strongest.periodHours },
  }];
}
