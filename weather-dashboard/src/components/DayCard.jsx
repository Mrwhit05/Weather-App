function DayCard({ day }) {
    if (!day) return null;

    console.log(day);
    const dateObj = new Date(day.date);
    //const dayName = dateObj.getDay;
    const dayName = dateObj.toLocaleDateString([], {weekday: "short"});
    //const icon = dateObj.weather[0].icon;
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();

    const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

    return (
        <div className="day-card">
            <p className="day-name">{isToday ? "Today" : dayName}</p>
            <img src={iconUrl} alt="weather icon"></img>
            <div className="temps">
                <span className="min">{Math.round(day.min)}°</span>
                <span className="max">{Math.round(day.max)}°</span>
            </div>
        </div>
    );
}

export default DayCard;