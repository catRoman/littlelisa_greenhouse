import { useEffect, useState } from "react";
import {
  fetchWeatherData,
  type WeatherData,
} from "../../services/currentWeather";
import WeatherInfo from "./WeatherInfo";

export default function WeatherAp() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const weatherData = await fetchWeatherData();
        if (weatherData) {
          setCurrentWeather(weatherData);
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 300_000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <aside className="align-end flex flex-col gap-2">
      <h3 className="self-center text-xs font-bold">Current Weather</h3>
      {isLoading ? (
        <p> Loading Current Weather...</p>
      ) : currentWeather ? (
        <WeatherInfo data={currentWeather} />
      ) : (
        <p>Error Loading Weather Data...</p>
      )}
    </aside>
  );
}
