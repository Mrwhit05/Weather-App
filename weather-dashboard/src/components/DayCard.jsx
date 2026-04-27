function DayCard({ day }) {
    if (!day) return null;

    console.log(day);
    const dateObj = new Date(day.date);
    const dayName = dateObj.toLocaleDateString([], {weekday: "short"});
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();

    const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

    const tempDiff = Math.round(day.max) - Math.round(day.min);
    let diffBar = "";
    for (let i = 0; i < tempDiff; i++){
        if (i % 3 === 0){
            diffBar += "=";
        }
    }

    return (
        <div className="day-card">
            <p className="day-name">{isToday ? "Today" : dayName}</p>
            <img src={iconUrl} alt="weather icon"></img>
            <div className="temps">
                <span className="min">{Math.round(day.min)}°</span>
                <span className="diffBar">{diffBar}</span>
                <span className="max">{Math.round(day.max)}°</span>
            </div>
        </div>
    );
}

export default DayCard;