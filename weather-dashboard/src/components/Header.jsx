import WeatherCard from "./WeatherCard";

function Header({ weather }) {
    if (!weather) return null;
    
  return (
    <div className="headerText">
          <h2>{weather.name}</h2>
          {weather && <WeatherCard weather={weather} />}
          <p>Condition: {weather.weather[0].description}</p>
          <p>Feels Like: {weather.main.feels_like}°F </p>
          <p>Min: {weather.main.temp_min} Max: {weather.main.temp_max}</p>
          <p>Humidity: {weather.main.humidity}%</p>
    </div>
  );
}

export default Header;