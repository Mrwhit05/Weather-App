import {
    ComposedChart,
    Bar,
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
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
            max: Math.round(day.max),
            range: Math.round(day.max) - Math.round(day.min)
        }));
    }

    return (
        <div>
            {type === "hourly" && <p>Hourly Temperature</p>}
            {type === "daily" && <p>Daily Temperature</p>}
        
            <ResponsiveContainer width="100%" height={250}>
                {type === "hourly" ? (
                    <LineChart data={chartData}>
                        <XAxis dataKey="time" />
                        <YAxis
                            domain={["0", "100"]}
                            label={{
                                value: "°F",
                                angle: -90,
                                position: "insideLeft"
                            }}
                        />
                        <Tooltip
                            formatter={value => `${value}°F`}
                        />

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
                    </LineChart>
                ) : (
                    <ComposedChart data={chartData}>
                        <XAxis dataKey="time" />
                        <YAxis
                            domain={[0, 100]}
                            label={{
                                value: "°F",
                                angle: -90,
                                position: "insideLeft"
                            }}
                        />
                        <Tooltip
                            formatter={value => `${value}°F`}
                        />
                        
                        <Area
                            type="monotone"
                            dataKey="min"
                            name="Temperature Range Base"
                            stackId="temperature"
                            stroke="none"
                            fill="transparent"
                            legendType="none"
                            tooltipType="none"
                            isAnimationActive={false}
                        />

                        <Area
                            type="monotone"
                            dataKey="range"
                            name="Daily Range"
                            stackId="temperature"
                            stroke="none"
                            fill="#3b82f6"
                            fillOpacity={0.18}
                            legendType="none"
                            tooltipType="none"
                            isAnimationActive={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="max"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="High"
                        />

                        <Line
                            type="monotone"
                            dataKey="min"
                            stroke="#f97316"
                            strokeWidth={3}
                            name="Low"
                        />

                    </ComposedChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

function RainChart({ data, type }){
    if (!data || data.length === 0) return null;

    let rainChartData;
    if (type === "hourly") {
        rainChartData = data.slice(0, 8).map(item => ({
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
                    <YAxis yAxisId="left" label={{value: "Rainfall (mm)", angle: -90, position: "insideLeft"}} domain={[0, rainChartData.rain > 3 ? "auto" : 3]}/>
                    <YAxis yAxisId="right" orientation="right" label={{value: "% Chance", angle: -90, position: "insideRight"}} domain={[0, 100]} tickFormatter={value => `${value}%`}/>
                    <Tooltip formatter={(value, name) => [name === "Chance of Rain" ? `${value}%` : `${Number(value).toFixed(2)} mm`, name]} />

                    <Line dataKey="pop" yAxisId="right" type="monotone" name="Chance of Rain" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Bar dataKey="rain" yAxisId="left" name="Rainfall" fill="#25bfef"/>
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
                    <XAxis dataKey="time"  />
                    <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`}/>
                    <Tooltip formatter={(value) => [`${value}%`, "Humidity"]} />
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
            windDirection = "Unknown";
    }

    return (
        <div className="flex items-center w-full max-w-[420px] mx-auto" role="img" aria-label={`Wind ${data[0].wind.speed} mph from the ${windDirection}${data[0].wind.gust != null ? `, gusts ${data[0].wind.gust} mph` : ""}`}>
            <div className="basis-[60%] min-w-0 flex justify-center">
                <div className="compass relative w-28 h-28 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <span className="north absolute top-1 left-1/2 -translate-x-1/2 text-sm font-bold">N</span>
                    <span className="south absolute bottom-1 left-1/2 -translate-x-1/2 text-sm font-bold">S</span>
                    <span className="east absolute right-1 top-1/2 -translate-y-1/2 text-sm font-bold">E</span>
                    <span className="west absolute left-1 top-1/2 -translate-y-1/2 text-sm font-bold">W</span>
                    <div className="needle absolute w-1 h-12 rounded-full origin-bottom" style={{ transform: `rotate(${data[0].wind.deg}deg)`}}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 z-10"></div>
                </div>
            </div>
            <div className="basis-[40%] min-w-0 pl-2">
                <p className="font-bold leading-none text-3xl">{Math.round(data[0].wind.deg)}° {windDirection}</p>
                <p className="font-bold mt-2 text-sm text-gray-500">{data[0].wind.speed} mph</p>
                {data[0].wind.gust != null && <p className="font-bold text-sm text-gray-500">Gusts {data[0].wind.gust} mph</p>}
            </div>
        </div>
    )

}

export { TemperatureChart, RainChart, HumidityChart, WindCompass };