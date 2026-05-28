import WeatherCard from "./WeatherCard";

function Header({ weather, aqiData }) {
    if (!weather || !aqiData) return null;

    console.log("aqiData", aqiData);
    const aqi = aqiData.main.aqi;
    const components = aqiData.components;
    const aqiLabels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const aqiLabel = aqiLabels[aqi - 1];

    const tempC = (weather.main.temp - 32) * 5/9;
    const dewPointC = tempC - ((100 - weather.main.humidity) / 5);
    const dewPoint = (dewPointC * (9/5)) + 32;

  return (
    <div className="headerText">
          <h2>{weather.name}</h2>
          {weather && <WeatherCard weather={weather} className="bg-gray-700 rounded-2xl p-6 text-lg min-w-[200px]"/>}
          <p>Condition: {weather.weather[0].description}</p>
          <p>Feels Like: {weather.main.feels_like}°F </p>
          <p>Min: {weather.main.temp_min} Max: {weather.main.temp_max}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Pressure: {weather.main.pressure / 100}</p>
          <p>Visibility: {weather.visibility / 100}%</p>
          <p>AQI: {aqi} - {aqiLabel}</p>
          <p>Dew Point: {dewPoint}</p>
    </div>
  );
}

export default Header;