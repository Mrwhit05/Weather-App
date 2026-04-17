import "./App.css";
import {useState} from "react";
import SearchBar from "./components/SearchBar";
import Header from "./components/Header";
import WeatherCard from "./components/WeatherCard";
import DayCard from "./components/DayCard";

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

    const midday = dayData.find(item => item.dt_txt.includes("12:00:00")) || dayData[0];
    return {date, min, max, icon: midday.weather[0].icon};
  })
}

function App() {
  const [weather, setWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

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
    }
    catch (error){
      console.error("Error fetching weather: ", error);
    }
  };

  return (
    <div>
      <h1>Weather Insight Dashboard</h1>
      <SearchBar onSearch={handleSearch}/>  
      <div className="header">
        {weather && <Header weather={weather} />}
        {weather && <WeatherCard weather={weather} />}
      </div>

      <div className="hourly-carousel">
        {Array.isArray(hourlyData) && hourlyData.slice(0, 8).map((hour, index) => (
          <WeatherCard key={index} weather={hour} />
        ))}
      </div>
      <div className="daily-forecast">
        {dailyData.sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5).map((day, index) => (
          <DayCard key={index} day={day} />
        ))}
      </div>
    </div>
  );
}

export default App;
