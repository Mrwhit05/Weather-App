import WeatherCard from "./WeatherCard";

function Header({ weather, hourlyData }) {
    if (!weather) return null;
  
    /*
    console.log("aqiData", aqiData);
    const aqi = aqiData.main.aqi;
    const components = aqiData.components;
    const aqiLabels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const aqiLabel = aqiLabels[aqi - 1];
    */
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
      { label: "Dew Point", value: dewPoint, unit: "°F", note: dewIndex },
    ];


  return (
    <div className="headerText">
          <h2>{weather.name}</h2>
          {weather && <WeatherCard weather={weather} caption={weather.weather[0].description} className="bg-gray-700 rounded-2xl p-6 text-lg min-w-[200px]"/>}
          
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
    </div>
  );
}

export default Header;