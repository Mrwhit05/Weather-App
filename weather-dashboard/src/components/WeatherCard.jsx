function WeatherCard({ weather }) {
    if (!weather) return null;

    const date = new Date(weather.dt * 1000);
    const time = date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    const icon = weather.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;


    return (
        <div className="weather-card">
            <p className="time">{time}</p>
            <img src={iconUrl} alt="weather icon"></img>
            <p className="temp">{Math.round(weather.main.temp)}°F</p>            
        </div>
    );
}

export default WeatherCard;