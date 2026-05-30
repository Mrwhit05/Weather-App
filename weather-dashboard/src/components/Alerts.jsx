export function addAQI({hourlyData, aqiData}) {
  return hourlyData.map(hour => {
    const match = aqiData.find(a => a.dt === hour.dt);
    return { ...hour, aqi: match ? match.main.aqi : null};
  });
}

export function buildAlert(type, severity, title, message, issuedAt, expiresAt, icon) {
  let id = crypto.randomUUID();
  return {id, type, severity, title, message, issuedAt, expiresAt, icon};
}

function compressAlerts(alerts) {
  if (alerts.length === 0) {
    return [];
  }

  const sorted = [...alerts].sort((a, b) => 
    a.type.localeCompare(b.type) || a.issuedAt - b.issuedAt
  );

  const grouped = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.type === current.type) {
      current.expiresAt = next.expiresAt;
    } else {
      grouped.push(current);
      current = { ...next };
    }
  }
  grouped.push(current);

  return grouped;
}

export function compileAlerts({ hourlyData, dailyData}) {
  let alerts = [];
  let next24 = hourlyData.slice(0, 8);
  
  for (let i = 0; i < next24.length; i++){
    //RAIN
    const rainDensity = next24[i].rain?.["3h"] ?? 0;
    //Critical
    if (rainDensity > 25.4){
      alerts.push(buildAlert(
        "XTRM_RAIN",
        "critical",
        "Flash Flood Emergency",
        `Extreme rain of ${rainDensity} mm/hr at ${next24[i].dt_txt}. Flash flooding is likely.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Warning
    else if (rainDensity > 12.7){
      alerts.push(buildAlert(
        "HIGH_RAIN",
        "warning",
        "Heavy Rain Warning",
        `Heavy rain of ${rainDensity} mm/hr at ${next24[i].dt_txt}. Risk of localized flooding.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Watch
    else if (rainDensity > 7.6){
      alerts.push(buildAlert(
        "MID_RAIN",
        "watch",
        "Moderate Rain Watch",
        `Moderate rain of ${rainDensity} mm/hr expected at ${next24[i].dt_txt}. Reduced visibility and wet roads likely.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Info
    else if (rainDensity > 2.5){
      alerts.push(buildAlert(
        "LIGHT_RAIN",
        "info",
        "Light Rain Advisory",
        `Light rain of ${rainDensity} mm/hr expected at ${next24[i].dt_txt}`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //WIND
    //Critical
    if (next24[i].wind.speed > 50){
      alerts.push(buildAlert(
        "XTRM_WIND",
        "critical",
        "Extreme Wind Emergency",
        `Dangerously high winds of ${next24[i].wind.speed} mph at ${next24[i].dt_txt}`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Warning
    else if (next24[i].wind.speed > 25){
      alerts.push(buildAlert(
        "HIGH_WIND",
        "warning",
        "High Wind Warning",
        `High winds of ${next24[i].wind.speed} mph at ${next24[i].dt_txt}`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Watch
    else if (next24[i].wind.speed > 20){
      alerts.push(buildAlert(
        "MID_WIND",
        "watch",
        "Wind Watch",
        `Winds of ${next24[i].wind.speed} mph at ${next24[i].dt_txt}. Secure outdoor furniture and decorations.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Info
    else if (next24[i].wind.speed > 15){
      alerts.push(buildAlert(
        "LIGHT_WIND",
        "info",
        "Breezy Advisory",
        `Winds of ${next24[i].wind.speed} mph expected at ${next24[i].dt_txt}`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //TEMPERATURE COLD
    //Critical
    if (next24[i].main.temp < 0){
      alerts.push(buildAlert(
        "XTRM_COLD",
        "critical",
        "Wind Chill Emergency",
        `Dangerous temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Life-threatening wind chills possible. Limit time outdoors.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Warning
    else if (next24[i].main.temp < 20){
      alerts.push(buildAlert(
        "HIGH_COLD",
        "warning",
        "Hard Freeze Warning",
        `Temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Hard freeze conditions. Risk of burst pipes and frostbite with prolonged exposure.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Watch
    else if (next24[i].main.temp < 32){
      alerts.push(buildAlert(
        "MID_COLD",
        "watch",
        "Freeze Watch",
        `Temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Freezing conditions possible. Protect sensitive plants and exposed pipes.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Info
    else if (next24[i].main.temp < 40){
      alerts.push(buildAlert(
        "LIGHT_COLD",
        "info",
        "Cool Advisory",
        `Temperature dropping to ${next24[i].main.temp}°F at ${next24[i].dt_txt}. A jacket is recommended.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //TEMPERATURE HOT
    //Critical
    if (next24[i].main.temp > 110){
      alerts.push(buildAlert(
        "XTRM_HEAT",
        "critical",
        "Extreme Heat Emergency",
        `Dangerous temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Heat stroke risk is high. Stay indoors in air conditioning.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Warning
    else if (next24[i].main.temp > 100){
      alerts.push(buildAlert(
        "HIGH_HEAT",
        "warning",
        "Heat Warning",
        `Temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Heat exhaustion likely without precautions. Avoid outdoor activity during peak hours.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Watch
    else if (next24[i].main.temp > 95){
      alerts.push(buildAlert(
        "MID_HEAT",
        "watch",
        "Heat Watch",
        `Temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Heat-related illness possible with prolonged outdoor exposure.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Info
    else if (next24[i].main.temp > 90){
      alerts.push(buildAlert(
        "LIGHT_HEAT",
        "info",
        "Warm Advisory",
        `Temperature of ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Stay hydrated and limit strenuous activity.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //FOG
    //Critical
    if (next24[i].visibility < 161){
      alerts.push(buildAlert(
        "XTRM_FOG",
        "critical",
        "Zero Visibility Emergency",
        `Near-zero visibility at ${next24[i].dt_txt}. Do not drive. Extremely dangerous conditions.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Warning
    else if (next24[i].visibility < 402){
      alerts.push(buildAlert(
        "HIGH_FOG",
        "warning",
        "Dense Fog Warning",
        `Visibility of ${(next24[i].visibility / 1609).toFixed(2)} mi at ${next24[i].dt_txt}. Driving is hazardous. Avoid travel if possible.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Watch
    else if (next24[i].visibility < 805){
      alerts.push(buildAlert(
        "MID_FOG",
        "watch",
        "Dense Fog Watch",
        `Visibility reduced to ${(next24[i].visibility / 1609).toFixed(2)} mi at ${next24[i].dt_txt}. Use low-beam headlights and reduce speed.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    //Info
    else if (next24[i].visibility < 1609){
      alerts.push(buildAlert(
        "LIGHT_FOG",
        "info",
        "Fog Advisory",
        `Visibility reduced to ${(next24[i].visibility / 1609).toFixed(1)} mi at ${next24[i].dt_txt}. Allow extra travel time.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //UV
    //Info
    //Watch
    //Warning
    //Critical

    //HUMIDITY
    //Critical
    if (next24[i].main.humidity > 95 && next24[i].main.temp > 105){
      alerts.push(buildAlert(
        "XTRM_HUMID",
        "critical",
        "Dangerous Humidity Emergency",
        `Humidity at ${next24[i].main.humidity}% with ${next24[i].main.temp}°F at ${next24[i].dt_txt}. Dangerous heat index. Risk of heat stroke is severe.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Warning
    else if (next24[i].main.humidity > 90){
      alerts.push(buildAlert(
        "HIGH_HUMID",
        "warning",
        "Oppressive Humidity Warning",
        `Humidity at ${next24[i].main.humidity}% at ${next24[i].dt_txt}. Heat index significantly elevated. Limit strenuous activity.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Watch
    else if (next24[i].main.humidity > 80){
      alerts.push(buildAlert(
        "MID_HUMID",
        "watch",
        "High Humidity Watch",
        `Humidity at ${next24[i].main.humidity}% at ${next24[i].dt_txt}. Feels significantly warmer than actual temperature.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Info
    else if (next24[i].main.humidity > 70){
      alerts.push(buildAlert(
        "LIGHT_HUMID",
        "info",
        "Humidity Advisory",
        `Humidity at ${next24[i].main.humidity}% at ${next24[i].dt_txt}. Conditions may feel uncomfortable outdoors.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //STORM
    const weatherID = next24[i].weather[0].id;

    //Critical
    if (weatherID === 781){
      alerts.push(buildAlert(
        "XTRM_STORM",
        "critical",
        "Tornado Emergency",
        `Tornado conditions detected at ${next24[i].dt_txt}. Take shelter in an interior room on the lowest floor immediately.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Warning
    else if (weatherID >= 212 && weatherID <= 221){
      alerts.push(buildAlert(
        "HIGH_STORM",
        "warning",
        "Severe Thunderstorm Warning",
        `Severe thunderstorm at ${next24[i].dt_txt}. Heavy rain, dangerous lightning, and hail possible.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Watch
    else if (weatherID >= 202 && weatherID <= 211){
      alerts.push(buildAlert(
        "MID_STORM",
        "watch",
        "Severe Storm Watch",
        `Severe thunderstorm approaching at ${next24[i].dt_txt}. Move indoors and away from windows.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
    
    //Info
    else if (weatherID >= 200 && weatherID <= 201){
      alerts.push(buildAlert(
        "LIGHT_STORM",
        "info",
        "Storm Advisory",
        `Thunderstorm possible at ${next24[i].dt_txt}. Stay aware of changing conditions.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //AIR QUALITY
    //Critical
    if (next24[i].aqi >= 5){
      alerts.push(buildAlert(
        "XTRM_AQI",
        "critical",
        "Hazardous Air Emergency",
        `Air quality is very poor at ${next24[i].dt_txt}. Health alert — everyone may experience serious effects. Stay indoors with windows closed.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Warning
    else if (next24[i].aqi >= 4){
      alerts.push(buildAlert(
        "HIGH_AQI",
        "warning",
        "Air Quality Warning",
        `Air quality is poor at ${next24[i].dt_txt}. Everyone may begin to experience health effects. Minimize time outdoors.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Watch
    else if (next24[i].aqi >= 3){
      alerts.push(buildAlert(
        "MID_AQI",
        "watch",
        "Air Quality Watch",
        `Air quality is moderate at ${next24[i].dt_txt}. Sensitive groups should limit prolonged outdoor activity.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Info
    else if (next24[i].aqi >= 2){
      alerts.push(buildAlert(
        "LIGHT_AQI",
        "info",
        "Air Quality Advisory",
        `Air quality is fair at ${next24[i].dt_txt}. Unusually sensitive individuals may want to limit prolonged outdoor exertion.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //SNOW
    const snowDensity = next24[i].snow?.["3h"] ?? 0; 

    //Critical
    if (snowDensity > 5 && next24[i].wind.speed > 35){
      alerts.push(buildAlert(
        "XTRM_SNOW",
        "critical",
        "Blizzard Emergency",
        `Blizzard conditions at ${next24[i].dt_txt} — ${snowDensity} mm/hr snow with ${next24[i].wind.speed} mph winds. Zero visibility and life-threatening cold. Do not travel.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }


    //Warning
    else if (snowDensity > 2.5){
      alerts.push(buildAlert(
        "HIGH_SNOW",
        "warning",
        "Winter Storm Warning",
        `Heavy snow of ${snowDensity} mm/hr at ${next24[i].dt_txt}. Travel is hazardous. Allow extra time or delay travel.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Watch
    else if (snowDensity > 1){
      alerts.push(buildAlert(
        "MID_SNOW",
        "watch",
        "Snow Watch",
        `Moderate snow of ${snowDensity} mm/hr at ${next24[i].dt_txt}. Reduced visibility and slick roads expected.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }

    //Info
    else if (snowDensity > 0){
      alerts.push(buildAlert(
        "LIGHT_SNOW",
        "info",
        "Light Snow Advisory",
        `Light snow of ${snowDensity} mm/hr at ${next24[i].dt_txt}. Roads may become slippery.`,
        Date.now(),
        next24[i].dt + (3 * 60 * 60),
        next24[i].weather[0].icon
      ))
    }
  }
  return compressAlerts(alerts);
}

function AlertCard({ alert }) {
  const alertStart = new Date(alert.issuedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const alertEnd = new Date(alert.expiresAt * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return (
    <div className="border-l-4 rounded-lg p-3 mb-2">
      <div className="">
        <p className="font-semibold text-sm">{alert.title}</p>
        <p>{alert.message}</p>
        <p>{alertStart} - {alertEnd}</p>
      </div>
    </div>
  );
}

export default AlertCard;