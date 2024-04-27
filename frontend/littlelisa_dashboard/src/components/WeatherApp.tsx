import { useEffect, useState } from "react";
import { fetchWeatherData, type WeatherData } from "../services/currentWeather";

export default function WeatherAp() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>();

  useEffect(() => {
    setInter
    const weatherData = fetchWeatherData();
  }, []);

  return (
    <aside>
      <h3>Current Weather</h3>
      <img width="40px" src="../../public/assets/noun-sun-83706.svg" />
      <p>Temp: {temp}</p>
    </aside>
  );
}
