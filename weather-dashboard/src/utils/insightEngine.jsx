import { findTemperatureTrends } from "./trendAnalysis";
import { findDailySummaryInsight } from "./dailySummary";

/*
import { findTemperatureTrends } from "./trendAnalysis";
import { findRainInsights } from "./rainAnalysis";
import { findAQIInsights } from "./airQualityAnalysis";

export function generateInsights({ hourlyData, dailyData, aqiData }) {
  const candidates = [
    ...findTemperatureTrends(hourlyData),
    ...findRainInsights(hourlyData),
    ...findAQIInsights(hourlyData, aqiData),
  ];

  return candidates
    .sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))
    .slice(0, 5);
}
*/

const insight_thresholds = {
    forecast: {
        hoursToAnalyze: 24,
        maxVisibleInsights: 15,
        slotHours: 3,
    },

    outdoorWindow: {
        minConsecutiveHours: 6,
        minScore: 70,
        preferred: {
            maxPop: 0.20,
            maxRainMM: 0,
            maxWindMph: 12,
            minTempF: 55,
            maxTempF: 82,
            minVisMiles: 6,
            maxAQI: 2,
        },
        acceptable: {
            maxPop: 0.35,
            maxRainMM: 0.25,
            maxWindMph: 18,
            minTempF: 45,
            maxTempF: 90,
            minVisMiles: 3,
            maxAQI: 3,
        },
    },

    commute: {
        morning: {startHour: 6, endHour: 9},
        evening: {startHour: 16, endHour: 19},
        minorImpact: {
            minPop: 0.20,
            maxVisMiles: 6,
            minWindMph: 15,
        },
        difficulty: {
            minPop: 0.50,
            minRainMM: 2.5,
            minSnowMM: 1,
            maxVisMiles: 3,
            minWindMph: 25,
        },
    },

    tempSwing: {
        noticeable: {
            threeHourChangeF: 8,
            sixHourChangeF: 12,
        },
        sharp: {
            threeHourChangeF: 12,
            sixHourChangeF: 18,
        },
        major: {
            sixHourChangeF: 20,
        },
        feelsLikeAmplifierF: 5,
    },

    precipitation: {
        minPopToStartPeriod: 0.30,
        minPopToShowInsight: 0.40,
        hoursUntilStartForPriority: 12,
        amountsMmPerThreeHours: {
        trace: 0.01,
        light: 0.25,
        moderate: 2.5,
        heavy: 7.6,
        },
    },

    dryStreak: {
        minimumConsecutiveHours: 12,
        maxPop: 0.20,
        clearSkyMaxCloudCover: 30,
        likelyDryMinPop: 0.10,
    },
};

const metersToMiles = 1 / 1609.344;

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function formatRange(startTimestamp, endTimestamp) {
    return `${formatTime(startTimestamp)}–${formatTime(endTimestamp)}`; 
}

function getRainMM(hour) {
    return hour.rain?.["3h"] ?? 0;
}

function getSnowMM(hour) {
  return hour.snow?.["3h"] ?? 0;
}

function getVisibilityMiles(hour) {
  return (hour.visibility ?? 10000) * metersToMiles;
}

function getHourOfDay(hour) {
  return new Date(hour.dt * 1000).getHours();
}

function isThunderstorm(hour) {
  const weatherId = hour.weather?.[0]?.id;
  return weatherId >= 200 && weatherId <= 232;
}

function getConditionLabel(hour) {
  if (getSnowMM(hour) > 0) return "snow";
  if (getRainMM(hour) > 0) return "rain";
  if (isThunderstorm(hour)) return "thunderstorms";
  return "precipitation";
}

function priorityRank(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] ?? 0;
}

function getForecastHours(hourlyData) {
  const slots = insight_thresholds.forecast.hoursToAnalyze / insight_thresholds.forecast.slotHours;
  return hourlyData.slice(0, slots);
}

function scoreOutdoorHour(hour) {
  const { preferred, acceptable } = insight_thresholds.outdoorWindow;
  const precipitationMM = getRainMM(hour) + getSnowMM(hour);
  const windMph = hour.wind?.speed ?? 0;
  const tempF = hour.main?.temp ?? 70;
  let score = 100;

  if ((hour.pop ?? 0) > acceptable.maxPop) score -= 35;
  else if ((hour.pop ?? 0) > preferred.maxPop) score -= 10;
  if (precipitationMM > acceptable.maxRainMM) score -= 25;
  else if (precipitationMM > preferred.maxRainMM) score -= 10;
  if (windMph > acceptable.maxWindMph) score -= 15;
  else if (windMph > preferred.maxWindMph) score -= 5;
  if (tempF < acceptable.minTempF || tempF > acceptable.maxTempF) score -= 20;
  else if (tempF < preferred.minTempF || tempF > preferred.maxTempF) score -= 8;
  if (getVisibilityMiles(hour) < acceptable.minVisMiles) score -= 20;
  else if (getVisibilityMiles(hour) < preferred.minVisMiles) score -= 8;
  if (hour.aqi != null && hour.aqi > acceptable.maxAQI) score -= 20;
  else if (hour.aqi != null && hour.aqi > preferred.maxAQI) score -= 8;
  return Math.max(score, 0);
}

export function findBestOutdoorWindow(hourlyData) {
  const hours = getForecastHours(hourlyData);
  const requiredSlots = insight_thresholds.outdoorWindow.minConsecutiveHours /
    insight_thresholds.forecast.slotHours;
  if (hours.length < requiredSlots) return [];

  const windows = [];
  for (let start = 0; start <= hours.length - requiredSlots; start += 1) {
    const windowHours = hours.slice(start, start + requiredSlots);
    const score = windowHours.reduce((sum, hour) => sum + scoreOutdoorHour(hour), 0) /
      windowHours.length;
    windows.push({ hours: windowHours, score });
  }
  windows.sort((a, b) => b.score - a.score);
  const best = windows[0];
  if (!best || best.score < insight_thresholds.outdoorWindow.minScore) return [];

  const finalHour = best.hours[best.hours.length - 1];
  return [{
    id: `outdoor-window-${best.hours[0].dt}`,
    category: "outdoor",
    priority: "medium",
    title: `Best time for a picnic - ${best.score >= 85 ? "Excellent" : best.score >= 75 ? "Good" : "Fair"}`,
    message: `${formatTime(best.hours[0].dt)} to ${formatTime(finalHour.dt + 10800)} looks like a great time to be outside. ` +
      `${best.score >= 85 ? "Comfortable temperatures, light winds, and dry conditions make it a good window for a picnic, walk, or other outdoor plans." : "Conditions look suitable for a walk or other light outdoor plans."}`,
    startsAt: best.hours[0].dt,
    endsAt: finalHour.dt + 10800,
    evidence: { score: Math.round(best.score) },
  }];
}

function getNextCommutePeriod(hours, now) {
  const nowDate = new Date(now * 1000);
  const todayKey = nowDate.toDateString();
  const definitions = [
    { label: "Morning commute", period: insight_thresholds.commute.morning },
    { label: "Evening commute", period: insight_thresholds.commute.evening },
  ];
  const periods = [];

  definitions.forEach(({ label, period }) => {
    const groups = {};
    hours.forEach(hour => {
      const hourOfDay = getHourOfDay(hour);
      if (hourOfDay < period.startHour || hourOfDay > period.endHour) return;
      const dateKey = new Date(hour.dt * 1000).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(hour);
    });

    Object.entries(groups).forEach(([dateKey, periodHours]) => {
      // Once a local commute window has ended, let the next one take over.
      if (dateKey === todayKey && nowDate.getHours() >= period.endHour) return;
      periods.push({ label, period, periodHours, startsAt: periodHours[0].dt });
    });
  });

  return periods
    .filter(candidate => candidate.periodHours[candidate.periodHours.length - 1].dt + 10800 > now)
    .sort((a, b) => a.startsAt - b.startsAt)[0] ?? null;
}

function getCommuteImpact(hours) {
  const { minorImpact, difficulty } = insight_thresholds.commute;
  const impact = {
    maxPop: Math.max(...hours.map(hour => hour.pop ?? 0)),
    maxRainMM: Math.max(...hours.map(getRainMM)),
    maxSnowMM: Math.max(...hours.map(getSnowMM)),
    minVisMiles: Math.min(...hours.map(getVisibilityMiles)),
    maxWindMph: Math.max(...hours.map(hour => hour.wind?.speed ?? 0)),
  };
  if (impact.maxPop >= difficulty.minPop || impact.maxRainMM >= difficulty.minRainMM ||
    impact.maxSnowMM >= difficulty.minSnowMM || impact.minVisMiles < difficulty.maxVisMiles ||
    impact.maxWindMph >= difficulty.minWindMph) return { ...impact, level: "difficult", priority: "high" };
  if (impact.maxPop > minorImpact.minPop || impact.maxRainMM > 0 || impact.maxSnowMM > 0 ||
    impact.minVisMiles < minorImpact.maxVisMiles || impact.maxWindMph >= minorImpact.minWindMph) {
    return { ...impact, level: "minor", priority: "medium" };
  }
  return { ...impact, level: "good", priority: "low" };
}

function describeCommuteImpact(impact) {
  const details = [];
  if (impact.maxSnowMM > 0) details.push("snowy roads");
  else if (impact.maxRainMM > 0) details.push("wet roads");
  else if (impact.maxPop > 0.20) details.push("a chance of precipitation");
  if (impact.minVisMiles < 6) details.push("reduced visibility");
  if (impact.maxWindMph >= 15) details.push("breezy conditions");
  return details.join(", ");
}

export function findCommuteInsights(hourlyData, now = Date.now() / 1000) {
  const hours = getForecastHours(hourlyData);
  const nextPeriod = getNextCommutePeriod(hours, now);
  if (!nextPeriod) return [];

  const { label, periodHours } = nextPeriod;
  const impact = getCommuteImpact(periodHours);
  const finalHour = periodHours[periodHours.length - 1];
  const periodName = label.toLowerCase();
  const isGood = impact.level === "good";
  return [{
    id: `commute-${label.toLowerCase().replace(" ", "-")}-${periodHours[0].dt}`,
    category: "commute",
    priority: impact.priority,
    title: isGood ? `Easy ${periodName}` :
      impact.level === "difficult" ? `Give yourself extra time this ${label.startsWith("Morning") ? "morning" : "evening"}` :
        `Plan for a slower ${periodName}`,
    message: isGood
      ? `The ${periodName} looks quiet, with no notable weather concerns for getting around.`
      : `${describeCommuteImpact(impact)} could make the ${periodName} less comfortable. Allow a little extra time.`,
    startsAt: periodHours[0].dt,
    endsAt: finalHour.dt + 10800,
    evidence: impact,
  }];
}

function isPrecipitationPeriod(hour) {
  return (hour.pop ?? 0) >= insight_thresholds.precipitation.minPopToStartPeriod ||
    getRainMM(hour) > 0 || getSnowMM(hour) > 0 || isThunderstorm(hour);
}

function groupPrecipitationPeriods(hours) {
  const periods = [];
  let currentPeriod = null;
  hours.forEach(hour => {
    if (isPrecipitationPeriod(hour)) {
      if (currentPeriod) currentPeriod.push(hour);
      else currentPeriod = [hour];
    } else if (currentPeriod) {
      periods.push(currentPeriod);
      currentPeriod = null;
    }
  });
  if (currentPeriod) periods.push(currentPeriod);
  return periods;
}

export function findPrecipitationInsight(hourlyData) {
  const firstPeriod = groupPrecipitationPeriods(getForecastHours(hourlyData))[0];
  if (!firstPeriod) return [];
  const totalRainMM = firstPeriod.reduce((total, hour) => total + getRainMM(hour), 0);
  const totalSnowMM = firstPeriod.reduce((total, hour) => total + getSnowMM(hour), 0);
  const peakPop = Math.max(...firstPeriod.map(hour => hour.pop ?? 0));
  const peakRainMM = Math.max(...firstPeriod.map(getRainMM));
  const startsWithinTwelveHours = firstPeriod[0].dt - Date.now() / 1000 <=
    insight_thresholds.precipitation.hoursUntilStartForPriority * 3600;
  if (peakPop < insight_thresholds.precipitation.minPopToShowInsight && totalRainMM < 1 &&
    totalSnowMM === 0 && !isThunderstorm(firstPeriod[0])) return [];

  const mostIntense = firstPeriod.reduce((current, hour) =>
    getRainMM(hour) + getSnowMM(hour) > getRainMM(current) + getSnowMM(current) ? hour : current
  );
  const condition = getConditionLabel(mostIntense);
  const finalHour = firstPeriod[firstPeriod.length - 1];
  const accumulation = totalSnowMM > 0 ? `around ${totalSnowMM.toFixed(1)} mm of snow` :
    totalRainMM > 0 ? `around ${(totalRainMM / 25.4).toFixed(2)} in of rain` : "a chance of precipitation";
  return [{
    id: `precipitation-${firstPeriod[0].dt}`,
    category: "precipitation",
    priority: startsWithinTwelveHours && (peakPop >= 0.60 || peakRainMM >= 2.5) ? "high" : "medium",
    title: `${condition[0].toUpperCase()}${condition.slice(1)} is most likely`,
    message: `Plan for ${condition} from ${formatTime(firstPeriod[0].dt)} to ${formatTime(finalHour.dt + 10800)}. ` +
      `The forecast calls for ${accumulation}.`,
    startsAt: firstPeriod[0].dt,
    endsAt: finalHour.dt + 10800,
    evidence: { peakPop, totalRainMM, totalSnowMM, peakRainMM },
  }];
}

function isDryHour(hour) {
  return (hour.pop ?? 0) <= insight_thresholds.dryStreak.maxPop &&
    getRainMM(hour) === 0 && getSnowMM(hour) === 0 && !isThunderstorm(hour);
}

export function findDryStreakInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  const requiredSlots = insight_thresholds.dryStreak.minimumConsecutiveHours /
    insight_thresholds.forecast.slotHours;
  const dryHours = [];

  for (const hour of hours) {
    if (!isDryHour(hour)) break;
    dryHours.push(hour);
  }

  if (dryHours.length < requiredSlots) return [];

  const finalHour = dryHours[dryHours.length - 1];
  const maxPop = Math.max(...dryHours.map(hour => hour.pop ?? 0));
  const averageCloudCover = dryHours.reduce((sum, hour) => sum + (hour.clouds?.all ?? 100), 0) /
    dryHours.length;
  const certainty = maxPop >= insight_thresholds.dryStreak.likelyDryMinPop ? "likely dry" : "dry";
  const skyDescription = averageCloudCover <= insight_thresholds.dryStreak.clearSkyMaxCloudCover ?
    " with mostly clear skies" : "";

  return [{
    id: `dry-streak-${dryHours[0].dt}`,
    category: "precipitation",
    priority: "low",
    title: "You can leave the umbrella at home",
    message: `The forecast stays ${certainty} through ${formatTime(finalHour.dt + 10800)}${skyDescription}. ` +
      "An umbrella does not look necessary for the first part of the day.",
    startsAt: dryHours[0].dt,
    endsAt: finalHour.dt + 10800,
    evidence: { maxPop, averageCloudCover: Math.round(averageCloudCover) },
  }];
}

export function findFeelsLikeDiscomfortInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  const strongest = hours.reduce((largest, hour) => {
    const difference = Math.abs((hour.main.feels_like ?? hour.main.temp) - hour.main.temp);
    return difference > largest.difference ? { hour, difference } : largest;
  }, { hour: null, difference: 0 });

  if (!strongest.hour || strongest.difference < 7) return [];
  const feelsWarmer = strongest.hour.main.feels_like > strongest.hour.main.temp;
  return [{
    id: `feels-like-${strongest.hour.dt}`,
    category: "comfort",
    priority: strongest.difference >= 10 ? "medium" : "low",
    title: feelsWarmer ? "Heat may feel more intense" : "A noticeable chill is expected",
    message: feelsWarmer
      ? `Around ${formatTime(strongest.hour.dt)}, humidity may make outdoor activity feel noticeably warmer. ` +
        "Plan for shade, water, and breaks."
      : `Around ${formatTime(strongest.hour.dt)}, wind may add a noticeable chill. Bring an extra layer if you will be outside.`,
    startsAt: strongest.hour.dt,
    endsAt: strongest.hour.dt + 10800,
    evidence: { temperatureF: strongest.hour.main.temp, feelsLikeF: strongest.hour.main.feels_like },
  }];
}

function windDirectionDifference(firstDirection, secondDirection) {
  const difference = Math.abs(firstDirection - secondDirection) % 360;
  return difference > 180 ? 360 - difference : difference;
}

export function findWindShiftInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  let strongest = null;
  for (let index = 1; index < hours.length; index += 1) {
    const prior = hours[index - 1];
    const current = hours[index];
    if (prior.wind?.deg == null || current.wind?.deg == null) continue;
    const shift = windDirectionDifference(prior.wind.deg, current.wind.deg);
    const windSpeed = Math.max(prior.wind.speed ?? 0, current.wind.speed ?? 0);
    if (shift >= 90 && windSpeed >= 10 && (!strongest || shift > strongest.shift)) {
      strongest = { prior, current, shift, windSpeed };
    }
  }
  if (!strongest) return [];

  return [{
    id: `wind-shift-${strongest.current.dt}`,
    category: "wind",
    priority: strongest.shift >= 135 ? "medium" : "low",
    title: "Wind direction shifts",
    message: `Winds shift about ${Math.round(strongest.shift)} degrees by ${formatTime(strongest.current.dt)}, ` +
      `with speeds near ${Math.round(strongest.windSpeed)} mph. Outdoor conditions may change quickly.`,
    startsAt: strongest.current.dt,
    endsAt: strongest.current.dt + 10800,
    evidence: { shiftDegrees: strongest.shift, windSpeedMph: strongest.windSpeed },
  }];
}

export function findAirQualityActivityInsight(hourlyData, aqiData) {
  const currentAqi = aqiData?.[0]?.main?.aqi ?? hourlyData.find(hour => hour.aqi != null)?.aqi;
  if (currentAqi == null) return [];

  const advice = {
    1: ["Good day for outdoor plans", "Air quality looks good, so there should not be air-quality concerns for normal outdoor activities."],
    2: ["Outdoor plans look fine", "Most people can enjoy time outside; sensitive people may prefer a lighter pace."],
    3: ["Moderate air quality", "If you are sensitive to air pollution, keep prolonged or intense activity shorter."],
    4: ["Poor air quality", "Consider moving strenuous plans indoors when practical."],
    5: ["Very poor air quality", "Avoid outdoor exertion and limit exposure when practical."],
  }[currentAqi];
  if (!advice) return [];

  return [{
    id: `air-quality-${currentAqi}`,
    category: "air-quality",
    priority: currentAqi >= 4 ? "high" : currentAqi === 3 ? "medium" : "low",
    title: advice[0],
    message: advice[1],
    startsAt: Date.now() / 1000,
    evidence: { aqi: currentAqi },
  }];
}

export function findHumidityComfortInsight(hourlyData) {
  const hour = getForecastHours(hourlyData)[0];
  if (!hour) return [];
  const humidity = hour.main.humidity;
  const label = humidity <= 30 ? "dry" : humidity >= 75 ? "muggy" : null;
  if (!label) return [];
  const message = {
    dry: "Consider water and moisturizer if you will be outside for a while.",
    muggy: "It may feel sticky outside, especially during activity.",
  }[label];
  return [{
    id: `humidity-${hour.dt}`,
    category: "comfort",
    priority: label === "muggy" ? "medium" : "low",
    title: label === "muggy" ? "Expect a muggy feel" : "The air may feel dry",
    message,
    startsAt: hour.dt,
    endsAt: hour.dt + 10800,
    evidence: { humidity },
  }];
}

export function findPressureDropInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  let largestDrop = null;
  for (let index = 2; index < hours.length; index += 1) {
    const drop = hours[index - 2].main.pressure - hours[index].main.pressure;
    if (drop >= 4 && (!largestDrop || drop > largestDrop.drop)) {
      largestDrop = { hour: hours[index], drop };
    }
  }
  if (!largestDrop) return [];
  return [{
    id: `pressure-drop-${largestDrop.hour.dt}`,
    category: "pressure",
    priority: largestDrop.drop >= 6 ? "medium" : "low",
    title: "Pressure is falling",
    message: `Pressure drops about ${Math.round(largestDrop.drop)} hPa over six hours by ${formatTime(largestDrop.hour.dt)}. ` +
      "That can signal a change toward more unsettled weather, but does not by itself predict a storm.",
    startsAt: largestDrop.hour.dt - 21600,
    endsAt: largestDrop.hour.dt,
    evidence: { pressureDropHpa: largestDrop.drop },
  }];
}

export function findClearingConditionsInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  const initialClouds = hours[0]?.clouds?.all;
  if (initialClouds == null || initialClouds < 70) return [];
  const clearingHour = hours.slice(1).find(hour => (hour.clouds?.all ?? 100) <= 35 &&
    (hour.pop ?? 0) <= 0.20 && getRainMM(hour) === 0 && getSnowMM(hour) === 0);
  if (!clearingHour) return [];
  return [{
    id: `clearing-${clearingHour.dt}`,
    category: "conditions",
    priority: "low",
    title: "Skies should clear later",
    message: `Clouds are expected to thin by ${formatTime(clearingHour.dt)}, opening up a better window for time outside.`,
    startsAt: clearingHour.dt,
    endsAt: clearingHour.dt + 10800,
    evidence: { initialCloudCover: initialClouds, clearingCloudCover: clearingHour.clouds.all },
  }];
}

export function findSunlightInsight(hourlyData, currentWeather) {
  const sunrise = currentWeather?.sys?.sunrise;
  const sunset = currentWeather?.sys?.sunset;
  if (!sunrise || !sunset) return [];
  const now = Date.now() / 1000;
  const nextSunrise = sunrise > now ? sunrise : sunrise + 86400;
  const nextSunset = sunset > now ? sunset : sunset + 86400;
  const isSunrise = nextSunrise < nextSunset;
  const eventTime = isSunrise ? nextSunrise : nextSunset;
  const nearbyHour = getForecastHours(hourlyData).reduce((closest, hour) =>
    Math.abs(hour.dt - eventTime) < Math.abs(closest.dt - eventTime) ? hour : closest
  );
  const cloudCover = nearbyHour.clouds?.all ?? 100;
  const rainExpected = (nearbyHour.pop ?? 0) > 0.30 || getRainMM(nearbyHour) > 0;
  return [{
    id: `sunlight-${eventTime}`,
    category: "sunlight",
    priority: "low",
    title: isSunrise ? "Catch the sunrise" : "Catch the sunset",
    message: `${isSunrise ? "Sunrise" : "Sunset"} is at ${formatTime(eventTime)}. ` +
      `${rainExpected ? "Rain may limit visibility." : cloudCover <= 40 ? "Relatively little cloud cover should make it a good time to look up." : "Clouds may limit the view."}`,
    startsAt: eventTime,
    evidence: { cloudCover, rainExpected },
  }];
}

export function findColdWeatherInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  if (!hours.length) return [];
  const coldestHour = hours.reduce((coldest, hour) =>
    hour.main.temp < coldest.main.temp ? hour : coldest
  );
  const coldestTemp = coldestHour.main.temp;

  if (coldestTemp >= 40) return [];

  const isFreezing = coldestTemp < 32;
  const isHardFreeze = coldestTemp < 20;
  return [{
    id: `cold-weather-${coldestHour.dt}`,
    category: "temperature",
    priority: isHardFreeze ? "high" : isFreezing ? "medium" : "low",
    title: isHardFreeze ? "Prepare for a hard freeze" : isFreezing ? "Freezing weather is on the way" : "A chilly stretch is ahead",
    message: isHardFreeze
      ? "Limit time outdoors and protect exposed pipes, pets, and sensitive plants."
      : isFreezing
        ? "Cover sensitive plants and bring pets inside. Roads and sidewalks may become slick where moisture is present."
        : "A warm layer will make outdoor plans more comfortable, especially early or late in the day.",
    startsAt: coldestHour.dt,
    endsAt: coldestHour.dt + 10800,
    evidence: { coldestTemperatureF: coldestTemp },
  }];
}

export function findPackingInsight(hourlyData) {
  const hours = getForecastHours(hourlyData);
  if (!hours.length) return [];
  const items = [];
  const maxPop = Math.max(...hours.map(hour => hour.pop ?? 0));
  const minFeelsLike = Math.min(...hours.map(hour => hour.main.feels_like ?? hour.main.temp));
  const averageClouds = hours.reduce((sum, hour) => sum + (hour.clouds?.all ?? 100), 0) / hours.length;
  if (maxPop >= 0.40) items.push("an umbrella");
  if (minFeelsLike < 55) items.push("a jacket");
  if (averageClouds <= 40 && maxPop < 0.30) items.push("sunglasses");
  if (!items.length) return [];
  return [{
    id: `packing-${hours[0].dt}`,
    category: "preparation",
    priority: "low",
    title: items.length === 1 && items[0] === "sunglasses" ? "Don't forget your sunglasses" :
      items.length === 1 && items[0] === "an umbrella" ? "Bring an umbrella" : "A few things to bring",
    message: items.length === 1 && items[0] === "sunglasses"
      ? "Mostly clear skies make sunglasses a useful thing to bring if you will be outside."
      : `Consider bringing ${items.join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
    startsAt: hours[0].dt,
    endsAt: hours[hours.length - 1].dt + 10800,
    evidence: { maxPop, minFeelsLike, averageClouds: Math.round(averageClouds) },
  }];
}

export function generateInsights({ hourlyData, dailyData, currentWeather, aqiData }) {
  if (!hourlyData?.length) return [];
  const precipitationInsights = findPrecipitationInsight(hourlyData);
  const feelsLikeInsights = findFeelsLikeDiscomfortInsight(hourlyData);
  return [
    ...findCommuteInsights(hourlyData),
    ...precipitationInsights,
    ...findDailySummaryInsight(dailyData),
    ...findTemperatureTrends(getForecastHours(hourlyData)),
    ...findBestOutdoorWindow(hourlyData),
    ...(precipitationInsights.length ? [] : findDryStreakInsight(hourlyData)),
    ...feelsLikeInsights,
    ...findWindShiftInsight(hourlyData),
    ...findAirQualityActivityInsight(hourlyData, aqiData),
    ...(feelsLikeInsights.length ? [] : findHumidityComfortInsight(hourlyData)),
    ...findColdWeatherInsight(hourlyData),
    ...findPressureDropInsight(hourlyData),
    ...findClearingConditionsInsight(hourlyData),
    ...findSunlightInsight(hourlyData, currentWeather),
    ...findPackingInsight(hourlyData),
  ]
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    .slice(0, insight_thresholds.forecast.maxVisibleInsights);
}
