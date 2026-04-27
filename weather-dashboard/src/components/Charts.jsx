import {
    ComposedChart,
    BarChart,
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
            time: new Date(day.date).toLocaleTimeString([], {
                weekday: "short"
            }),
            min: Math.round(day.min),
            max: Math.round(day.max)
        }));
    }

    return (
        <div>
            <ResponsiveContainer width="50%" height={250}>
                <p>Temperature Trend</p>
                <LineChart data={chartData}>
                    <XAxis dataKey="time"/>
                    <YAxis/>
                    <Tooltip formatter={(value) => `${value}°F`} />
                    {type === "hourly" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={3}
                    />
                    <Line
                        type="monotone"
                        dataKey="feels"
                        stroke="#f97316"
                        strokeWidth={3}
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
                    />
                    <Line
                        type="monotone"
                        dataKey="min"
                        stroke="#f97316"
                        strokeWidth={3}
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
            pop: Math.round(item.pop)
        }));
    }

    if (type === "daily"){
        rainChartData = data.slice(0, 12).map(day => ({
            time: new Date(day.date).toLocaleTimeString([], {
                weekday: "short"
            }),
            rain: day.rain ? day.rain["3h"] : 0,
            pop: Math.round(day.pop)
        }));        
    }

    return (
        <ResponsiveContainer width="50%" height={250}>
            <p>Rain Chart</p>
            <ComposedChart data={rainChartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />

                <Line dataKey="pop" />
                <Bar dataKey="rain" />
            </ComposedChart>
        </ResponsiveContainer>
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
            time: new Date(day.date).toLocaleTimeString([], {
                weekday: "short"
            }),
            humidity: Math.round(day.humidity)
        }));
    }

    return (
        <div>
            <ResponsiveContainer width="50%" height={250}>
                <p>Humidity Chart</p>
                <LineChart data={chartData}>
                    <XAxis dataKey="time"/>
                    <YAxis/>
                    <Tooltip formatter={(value) => `${value}°F`} />
                    {type === "hourly" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={3}
                    />
                    </>
                    )}

                    {type === "daily" && (
                    <>
                    <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#3b82f6"
                        strokeWidth={3}
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

    return (
        <div className="compass-container">
            <div className="compass">
                <div className="needle" style={{ transform: `rotate(${data[0].wind.deg}deg)`}}/>
            </div>
            <p>{Math.round(data[0].wind.speed)} mph</p>
        </div>
    )

}

export { TemperatureChart, RainChart, HumidityChart, WindCompass };