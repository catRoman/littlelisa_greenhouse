//weatherapi.com apr 26/2024
const weatherApiKey = "96315d212b3c425aac312511242704";

const currentWeatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}{&q=48.42,-123.53&aqi=no`;

export interface WeatherData {
  temp_c: number;
  weather_code: number;
  wind_kph: number;
  percip_mm: number;
  humidity: number;
  feelslike_c: number;
}

export async function fetchWeatherData(): Promise<WeatherData | null> {
  try {
    const response = await fetch(currentWeatherApiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch WeatherData");
    }

    const {
      condition: { code: weather_code },
      ...other
    } = await response.json();

    return { weather_code, ...other };
  } catch (error) {
    console.log("Error requesting current weather data", error);
    return null;
  }
}
