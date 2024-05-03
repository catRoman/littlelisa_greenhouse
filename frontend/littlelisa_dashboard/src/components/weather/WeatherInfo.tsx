import { type WeatherData } from "../../services/currentWeather";
import { weatherIcons } from "../../data/weather_icons";

interface WeatherInfoProps extends React.HTMLAttributes<HTMLHtmlElement> {
  data: WeatherData;
}

function handleWeatherIcon(weather_code: number, localtime: string) {
  const iconWeatherCodes = weatherIcons.map((obj) => obj.code);

  const dayNight_fn = (localtime: string): string => {
    const currHour = new Date(localtime).getHours();
    return currHour >= 6 && currHour < 18 ? "day" : "night";
  };
  const dayNight_str = dayNight_fn(localtime);

  if (iconWeatherCodes.includes(weather_code)) {
    const icon = weatherIcons.find((obj) => obj.code === weather_code)!.icon[
      dayNight_str
    ];
    console.log(icon);
    return icon;
  }

  for (let i = 0; i < weatherIcons.length; i++) {
    if (weatherIcons[i].code > weather_code) {
      return weatherIcons[i - 1].icon[dayNight_str];
    }
  }

  console.log(iconWeatherCodes);

  return weatherIcons[0].icon[dayNight_str];
}
export default function WeatherInfo({ data }: WeatherInfoProps) {
  const {
    localtime,
    temp_c,
    weather_code,
    wind_kph,
    precip_mm,
    humidity,
    feelslike_c,
  } = data;

  return (
    <div className="flex flex-col items-center gap-1 text-xs">
      <img
        className=""
        width="40px"
        src={handleWeatherIcon(weather_code, localtime)}
      />
      <span>{localtime}</span>
      <p className="font-bold">Temp:</p>
      <span>{temp_c} &deg;C</span>
      <p className="font-bold">Humidity:</p>
      <span>{humidity} %</span>
      <p className="font-bold">Feels Like:</p>
      <span>{feelslike_c} &deg;C</span>
      <p className="font-bold">Percipitaion</p>
      <span>{precip_mm} mm</span>
      <p className="font-bold">Wind Speed</p>
      <span>{wind_kph} kph</span>
    </div>
  );
}
