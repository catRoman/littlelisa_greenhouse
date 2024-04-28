//linseedstudio
type dayNight = {
  [key: string]: string;
  day: string;
  night: string;
};
export interface WeatherIcon {
  code: number;
  description: dayNight;
  icon: dayNight;
}

export const weatherIcons: WeatherIcon[] = [
  {
    code: 1000,
    description: {
      day: "sunny",
      night: "clear",
    },
    icon: {
      day: "../../public/assets/weather_icons/day_sunny.svg",
      night: "../../public/assets/weather_icons/night_clear.svg",
    },
  },
  {
    code: 1003,
    description: {
      day: "partly cloudy",
      night: "partly cloudy",
    },
    icon: {
      day: "../../public/assets/weather_icons/day_partly_cloudy.svg",
      night: "../../public/assets/weather_icons/night_partly_cloudy.svg",
    },
  },
  {
    code: 1006,
    description: {
      day: "cloudy",
      night: "cloudy",
    },
    icon: {
      day: "../../public/assets/weather_icons/cloudy.svg",
      night: "../../public/assets/weather_icons/cloudy.svg",
    },
  },
  {
    code: 1153,
    description: {
      day: "rain",
      night: "rain",
    },
    icon: {
      day: "../../public/assets/weather_icons/day_rain.svg",
      night: "../../public/assets/weather_icons/night_rain.svg",
    },
  },
  {
    code: 1213,
    description: {
      day: "snow",
      night: "snow",
    },
    icon: {
      day: "../../public/assets/weather_icons/snow.svg",
      night: "../../public/assets/weather_icons/snow.svg",
    },
  },
];
