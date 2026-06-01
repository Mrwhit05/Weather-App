function DayCard({ day }) {
    if (!day) return null;

    console.log(day);
    const dateObj = new Date(day.date);
    const dayName = dateObj.toLocaleDateString([], {weekday: "short"});
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();

    const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

    
    const tempDiff = Math.round(day.max) - Math.round(day.min);
    const left = Math.round(day.min);
    const width = tempDiff;

    return (
        <div className="day-card grid grid-cols-4 gap-4">
            <p className="day-name">{isToday ? "Today" : dayName}</p>
            <img src={iconUrl} alt="weather icon"></img>

            <div className="flex items-center gap-2 col-span-2">
                <span className="text-sm w-10">{Math.round(day.min)}°</span>

                <div className="relative w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className="absolute h-2 bg-blue-500 rounded-full"
                        style={{
                        left: `${left}%`,
                        width: `${width}%`
                        }}
                    />
                </div>

                <span className="text-sm w-10 text-right">{Math.round(day.max)}°</span>
            </div>
        </div>
    );
}

export default DayCard;