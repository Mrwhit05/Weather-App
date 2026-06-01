import {
    ComposedChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function TemperatureChart({ data, type }) {
    if (!data || data.length === 0) return null;

    let chartData;

    if (type === "hourly") {
        chartData = data.slice(0, 8).map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString([], {
                hour: "numeric"
            }),
            temp: Math.round(item.main.temp),
            feels: Math.round(item.main.feels_like)
        }));
    }

    if (type === "daily") {
        chartData = data.map(day => ({
            time: new Date(day.date).toLocaleDateString([], {
                weekday: "short"
            }),
            min: Math.round(day.min),
            max: Math.round(day.max)
        }));
    }

    return (
        <div>
            {type === "hourly" && <p>Hourly Temperature</p>}
            {type === "daily" && <p>Daily Temperature</p>}
            <ResponsiveContainer width="100%" height={250}>  
                <LineChart data={chartData}>
                    <XAxis dataKey="time"/>
                    <YAxis label={{ value: "°F", angle: -90, position: "insideLeft"}} domain={[0, 100]}/>
                    <Tooltip formatter={(value) => `${value}°F`} />
                    {type === "hourly" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Temperature"
                    />
                    <Line
                        type="monotone"
                        dataKey="feels"
                        stroke="#f97316"
                        strokeWidth={3}
                        name="Feels Like"
                    />
                    </>
                    )}

                    {type === "daily" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="max"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Temperature"
                    />
                    <Line
                        type="monotone"
                        dataKey="min"
                        stroke="#f97316"
                        strokeWidth={3}
                        name="Feels Like"
                    />
                    </>
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function RainChart({ data, type }){
    if (!data || data.length === 0) return null;

    let rainChartData;
    if (type === "hourly") {
        rainChartData = data.slice(0, 12).map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString([], {
                hour: "numeric"
            }),
            rain: item.rain ? item.rain["3h"] : 0,
            pop: Math.round(item.pop * 100)
        }));
    }

    if (type === "daily"){
        rainChartData = data.slice(0, 12).map(day => ({
            time: new Date(day.date).toLocaleDateString([], {
                weekday: "short"
            }),
            rain: day.rain ? day.rain.toFixed(2) : 0,
            pop: Math.round(day.pop)
        }));        
    }

    return (
        <div>
            {type === "hourly" && <p>Hourly Rain</p>}
            {type === "daily" && <p>Daily Rain Trend</p>}
            <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={rainChartData}>
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" label={{value: "Rainfall (mm)", angle: -90, position: "insideLeft"}}/>
                    <YAxis yAxisId="right" orientation="right" label={{value: "% Chance", angle: -90, position: "insideRight"}} domain={[0, 100]}/>
                    <Tooltip />

                    <Line dataKey="pop" yAxisId="right" type="monotone" name="Chance of Rain" />
                    <Bar dataKey="rain" yAxisId="left" name="Rainfall" fill="#0000ff"/>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

function HumidityChart({ data, type }) {
    if (!data || data.length === 0) return null;

    let chartData;

    if (type === "hourly") {
        chartData = data.slice(0, 8).map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString([], {
                hour: "numeric"
            }),
            humidity: Math.round(item.main.humidity)
        }));
    }

    if (type === "daily") {
        chartData = data.map(day => ({
            time: new Date(day.date).toLocaleDateString([], {
                weekday: "short"
            }),
            humidity: Math.round(day.humidity / 100)
        }));
    }

    return (
        <div>
            {type === "hourly" && <p>Hourly Humidity</p>}
            {type === "daily" && <p>Daily Humidity</p>}
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <XAxis dataKey="time"/>
                    <YAxis/>
                    <Tooltip formatter={(value) => `${value}%`} />
                    {type === "hourly" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3bcff6"
                        strokeWidth={3}
                        name="Humidity Percentage"
                    />
                    </>
                    )}

                    {type === "daily" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3bcff6"
                        strokeWidth={3}
                        name="Humidity Percentage"
                    />
                    </>
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function WindCompass({ data}) {
    if (!data || data.length === 0) return null;

    let windDescription = "";
    let windDirection = "";

    switch (true) {
        case data[0].wind.deg < 45:
            windDirection = "N";
            break;

        case data[0].wind.deg < 90:
            windDirection = "NE";
            break;
            
        case data[0].wind.deg < 135:
            windDirection = "E";
            break;

        case data[0].wind.deg < 180:
            windDirection = "SE";
            break;

        case data[0].wind.deg < 225:
            windDirection = "S";
            break;

        case data[0].wind.deg < 270:
            windDirection = "SW";
            break;

        case data[0].wind.deg < 315:
            windDirection = "W";
            break;

        case data[0].wind.deg < 360:
            windDirection = "NW";
            break;

        default:
            windDescription = "Unknown";
    }

    windDescription = `${Math.round(data[0].wind.speed)} mph ${data[0].wind.deg}° ${windDirection}`;
    

    return (
        <div className="compass-container flex flex-col items-center gap-2">
            <div className="compass relative w-32 h-32 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <span className="north absolute top-1 left-1/2 -translate-x-1/2 text-sm font-bold">N</span>
                <span className="south absolute bottom-1 left-1/2 -translate-x-1/2 text-sm font-bold">S</span>
                <span className="east absolute right-1 top-1/2 -translate-y-1/2 text-sm font-bold">E</span>
                <span className="west absolute left-1 top-1/2 -translate-y-1/2 text-sm font-bold">W</span>
                <div className="needle absolute w-1 h-14 rounded-full origin-bottom" style={{ transform: `rotate(${data[0].wind.deg}deg)`}}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 z-10"></div>
            </div>
            <p>{windDescription}</p>
        </div>
    )

}

export { TemperatureChart, RainChart, HumidityChart, WindCompass };