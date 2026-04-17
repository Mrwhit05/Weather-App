function Header({ weather }) {
    if (!weather) return null;
    
  return (
    <div className="headerText">
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°F</p>
          <p>Feels Like: {weather.main.feels_like}°F </p>
          <p>Min: {weather.main.temp_min} Max: {weather.main.temp_max}</p>
          <p>Condition: {weather.weather[0].description}</p>
    </div>
  );
}

export default Header;