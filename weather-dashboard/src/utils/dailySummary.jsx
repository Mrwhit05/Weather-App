const DAILY_SUMMARY_THRESHOLDS = {
  notableTemperatureChangeF: 8,
  rainyPopPercent: 40,
  meaningfulRainMM: 1,
};

function formatDayLabel(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString([], { weekday: "long" });
}

function isRainyDay(day) {
  return day.pop >= DAILY_SUMMARY_THRESHOLDS.rainyPopPercent ||
    day.rain >= DAILY_SUMMARY_THRESHOLDS.meaningfulRainMM;
}

function getTemperatureSummary(today, nextDay) {
  const highChange = Math.round(nextDay.max - today.max);
  if (Math.abs(highChange) < DAILY_SUMMARY_THRESHOLDS.notableTemperatureChangeF) return null;

  return highChange > 0 ? "warmer" : "cooler";
}

function getPrecipitationSummary(today, nextDay) {
  const todayRainy = isRainyDay(today);
  const nextDayRainy = isRainyDay(nextDay);

  if (nextDayRainy && !todayRainy) {
    return "wetter, with rain more likely";
  }
  if (!nextDayRainy && todayRainy) return "drier";
  if (nextDayRainy && nextDay.pop - today.pop >= 20) {
    return "more likely to see rain";
  }
  return null;
}

function describeRainChance(day) {
  if (isRainyDay(day)) return "Rain is possible, so keep an umbrella handy.";
  if (day.pop >= 20) return "A brief shower is possible.";
  return "It looks mostly dry.";
}

export function findDailySummaryInsight(dailyData) {
  if (!dailyData || dailyData.length < 2) return [];

  const [today, nextDay] = [...dailyData]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2);
  const highlights = [
    getTemperatureSummary(today, nextDay),
    getPrecipitationSummary(today, nextDay),
  ].filter(Boolean);
  const label = formatDayLabel(nextDay.date);
  const rainyTomorrow = isRainyDay(nextDay);

  return [{
    id: `daily-summary-${nextDay.date}`,
    category: "daily-summary",
    priority: rainyTomorrow || highlights.length >= 2 ? "medium" : "low",
    title: `${label} at a glance`,
    message: highlights.length
      ? `${label} should be ${highlights.slice(0, 2).join(" and ")} than today.`
      : `${label} should feel similar to today. ${describeRainChance(nextDay)}`,
    startsAt: new Date(`${nextDay.date}T00:00:00`).getTime() / 1000,
    endsAt: new Date(`${nextDay.date}T23:59:59`).getTime() / 1000,
    evidence: {
      today: { max: today.max, rain: today.rain, pop: today.pop, humidity: today.humidity },
      nextDay: { max: nextDay.max, rain: nextDay.rain, pop: nextDay.pop, humidity: nextDay.humidity },
    },
  }];
}
