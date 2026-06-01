function WeatherCard({ weather, className = "" }) {
    if (!weather) return null;

    const date = new Date(weather.dt * 1000);
    const time = date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    const icon = weather.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;


    return (
        <div className={`flex flex-col items-center text-center bg-gray-500 text-white border border-gray-500 p-3 min-w-[100px] shrink-0 ${className}`}>
            <p className="time">{time}</p>
            <img src={iconUrl} alt="weather icon"></img>
            <p className="temp">{Math.round(weather.main.temp)}°F</p>            
        </div>
    );
}

export default WeatherCard;