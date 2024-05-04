export const greenhouse_data = {
  lat: 48.42,
  long: -123.53,
  greenhouse_id: 1,
  greenhouse_location_str: "backyard",

  total_zones: 3,
  total_controllers: 1,
};

export const phoney_sensor_avgd = [
  {
    timestamp: "4:00",
    temperature: 19,
    humidity: 88,
    soil_moisture: 24,
  },
  {
    timestamp: "4:05",
    temperature: 17,
    humidity: 86,
    soil_moisture: 22,
  },
  {
    timestamp: "4:10",
    temperature: 16.6,
    humidity: 84,
    soil_moisture: 20,
  },
  {
    timestamp: "4:15",
    temperature: 14,
    humidity: 78,
    soil_moisture: 18,
  },
  {
    timestamp: "4:20",
    temperature: 15,
    humidity: 80,
    soil_moisture: 14,
  },
  {
    timestamp: "4:25",
    temperature: 13,
    humidity: 88,
    soil_moisture: 50,
  },
  {
    timestamp: "4:30",
    temperature: 16,
    humidity: 88,
    soil_moisture: 75,
  },
];

type cntrlDataType = {
  cntrl: string;
  currList: {
    zone: number;
    isActive: boolean;
  }[];
  iconPath: string;
};

export const cntrlData: cntrlDataType[] = [
  {
    cntrl: "fans",
    currList: [
      {
        zone: 1,
        isActive: true,
      },
      {
        zone: 2,
        isActive: false,
      },
      {
        zone: 3,
        isActive: true,
      },
      {
        zone: 4,
        isActive: false,
      },
    ],

    iconPath: "../../../public/assets/control icons/fans.svg",
  },
  {
    cntrl: "lights",
    currList: [
      {
        zone: 1,
        isActive: true,
      },
      {
        zone: 2,
        isActive: false,
      },
    ],
    iconPath: "../../../public/assets/control icons/lights.svg",
  },
  {
    cntrl: "water",
    currList: [
      {
        zone: 1,
        isActive: true,
      },
      {
        zone: 2,
        isActive: false,
      },
    ],
    iconPath: "../../../public/assets/control icons/water.svg",
  },
  {
    cntrl: "fertilizer",
    currList: [
      {
        zone: 1,
        isActive: true,
      },
      {
        zone: 2,
        isActive: false,
      },
    ],
    iconPath: "../../../public/assets/control icons/fertilizer.png",
  },
  {
    cntrl: "ventilation",
    currList: [
      {
        zone: 1,
        isActive: true,
      },
      {
        zone: 2,
        isActive: false,
      },
    ],
    iconPath: "../../../public/assets/control icons/vent.svg",
  },
];
