import "./App.css";
import {useState} from "react";
import SearchBar from "./components/SearchBar";
import Header from "./components/Header";
import Alerts from "./components/Alerts";
import WeatherCard from "./components/WeatherCard";
import DayCard from "./components/DayCard";
import { TemperatureChart, RainChart, HumidityChart, WindCompass } from "./components/Charts";

function getDailyForecast(list){
  const grouped = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!grouped[date]){
      grouped[date] = [];
    }
    grouped[date].push(item);
  });

  return Object.keys(grouped).map(date => {
    const dayData = grouped[date];

    const temps = dayData.map(d => d.main.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);

    const totalRain = dayData.reduce((sum, item) => {
      return sum + (item.rain ? item.rain["3h"] : 0);
    }, 0);

    const avgPop = dayData.reduce((sum, item) => {
      return sum + item.pop;
    }, 0) / dayData.length; 

    const avgHumidity = dayData.reduce((sum, item) => {
      return sum + item.main.humidity;
    }, 0) / dayData.length; 

    const midday = dayData.find(item => item.dt_txt.includes("12:00:00")) || dayData[0];
    return {date, min, max, icon: midday.weather[0].icon, rain: totalRain, pop: Math.round(avgPop * 100), humidity: Math.round(avgHumidity * 100)};
  })
}

function App() {
  const [weather, setWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  let sunriseAdded = false;
  let sunsetAdded = false;

  const sunrise = weather?.sys?.sunrise;
  const sunset = weather?.sys?.sunset;

  //const sunriseTime = new Date(sunrise * 1000);
  //const sunsetTime = new Date(sunset * 1000);

  const now = Date.now() / 1000;

  let nextSunrise = sunrise;
  if (sunrise < now) {
    nextSunrise = sunrise + 86400;
  }

  let nextSunset = sunset;
  if (sunset < now) {
    nextSunset = sunset + 86400;
  }

  const handleSearch = async (city) => {
    try {
      const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
      
      if (!API_KEY){
        console.error("API key is missing");
      }

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`
      );

      const data = await weatherResponse.json();

      if (data.cod !== 200){
        alert(data.message);
        return;
      }

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`
      )

      const forecastData = await forecastResponse.json();
      if (forecastData.cod != 200){
        alert(forecastData.message);
        return;
      }

      console.log(data);
      setWeather(data);
      
      setHourlyData(forecastData.list);
      console.log(forecastData.list);

      const daily = getDailyForecast(forecastData.list);
      setDailyData(daily);
      console.log("hourly: forecastData.list", forecastData.list);
      console.log("daily", daily);
    }
    catch (error){
      console.error("Error fetching weather: ", error);
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        {weather && <div>
          <p className="block px-4 py-2 hover:rounded-lg hover:bg-gray-100 transition-colors duration-150"><a href="#overview">Overview</a></p>
          <p className="block px-4 py-2 hover:rounded-lg hover:bg-gray-100 transition-colors duration-150"><a href="#forecast">Forecast</a></p>
          <p className="block px-4 py-2 hover:rounded-lg hover:bg-gray-100 transition-colors duration-150"><a href="#trends">Trends</a></p>
        </div>}
      </aside>

      <div className="main space-y-6">
        <div className="topBar bg-gray-100 flex justify-between items-center px-6 py-4 shadow">
          <h1>Weather Insight Dashboard</h1>
          <SearchBar onSearch={handleSearch}/>  
        </div>

        <section id="overview"></section>
        {weather && <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            {weather && <Header weather={weather} />}
          </div>

          <div className="alertsCenter">
            <div className="bg-white p-4 rounded-xl shadow">
              <Alerts weather={weather} hourlyData={hourlyData}></Alerts>
            </div>
            <div>
              <WindCompass data={hourlyData}></WindCompass>
              
            </div>
          </div>
        </div>}

        <section id="forecast"></section>
        {weather && <p>3-Hour Forecast</p>}
        <div className="hourly-carousel">
          {Array.isArray(hourlyData) && hourlyData.slice(0, 12).map((hour, index) => {
            const elements = [];
            const hourTime = hour.dt;

            const sunriseDate = new Date(nextSunrise);
            const sunriseString = sunriseDate.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            });

            const sunsetDate = new Date(nextSunset);
            const sunsetString = sunsetDate.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            });

            if (!sunriseAdded && nextSunrise && Math.abs(hourTime - nextSunrise) < 7200) {
              elements.push(
              <div key={`sunrise-${index}`} className="sun-card weather-card flex flex-col items-center text-center bg-gray-500 text-white border border-gray-500 p-3 min-w-[100px] shrink-0">
                <p>{sunriseString}</p>
                <img src="https://openweathermap.org/img/wn/01d@2x.png" alt="weather icon"></img>
                <p>Sunrise</p>
              </div>
              );
              sunriseAdded = true;
            }

            elements.push(<WeatherCard key={index} weather={hour} />);

            if (!sunsetAdded && nextSunset && Math.abs(hourTime - nextSunset) < 7200) {
              elements.push(
              <div key={`sunset-${index}`} className="sun-card weather-card flex flex-col items-center text-center bg-gray-500 text-white border border-gray-500 p-3 min-w-[100px] shrink-0">
                <p>{sunsetString}</p>
                <img src="https://openweathermap.org/img/wn/01n@2x.png" alt="weather icon"></img>
                <p>Sunset</p>
              </div>
              );
              sunsetAdded = true;
            }

            return elements;
          })}
        </div>

        {weather && <p>5-Day Forecast</p>}
        {weather && <div className="bg-white p-4 rounded-xl shadow divide-y">
          {dailyData.sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5).map((day, index) => (
            <DayCard key={index} day={day} />
          ))}
        </div>}

        <section id="trends"></section>
        {weather && <p>Trends</p>}
        {hourlyData.length > 0 && (<div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <TemperatureChart data={hourlyData} type="hourly" />
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <TemperatureChart data={dailyData} type="daily" />
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <RainChart data={hourlyData} type="hourly"/>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <RainChart data={dailyData} type="daily"/>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <HumidityChart data={hourlyData} type="hourly" />
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <HumidityChart data={dailyData} type="daily" />
            </div>

        </div>)}
      </div>
    </div>
  );
}

export default App;
