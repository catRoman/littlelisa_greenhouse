import { WEATHER_API_KEY } from "../data/api_keys";

const currentWeatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=48.42,-123.53&aqi=no`;

export type WeatherData = {
  temp_c: number;
  weather_code: number;
  wind_kph: number;
  precip_mm: number;
  humidity: number;
  feelslike_c: number;
  localtime: string;
};

export async function fetchWeatherData(): Promise<WeatherData | null> {
  try {
    const response = await fetch(currentWeatherApiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch WeatherData");
    }

    const {
      location: { localtime },
      current: {
        condition: { code: weather_code },
        ...other
      },
    } = await response.json();

    return { weather_code, localtime, ...other };
  } catch (error) {
    console.log("Error requesting current weather data", error);
    return null;
  }
}
