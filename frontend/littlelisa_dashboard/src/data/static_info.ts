import { cntrlDataType } from "../../types/common";
//TODO:Types for json data
export const greenhouse_data = {
  greenhouse: {
    lat: 48.42,
    long: -123.53,
    greenhouse_id: 1,
    greenhouse_location_str: "backyard",
    dimensions: { x: 12, y: 16 },
    total_zones: 3,
    total_controllers: 1,
  },
  zones: [
    {
      dimensions: { x: 4, y: 6, z: 2 },
      loc_coord: { x: 0, y: 0, z: 0 },
      sensorsAvailable: true,
      sensors: [
        {
          type: "DHT22",
          loc_coord: { x: 1, y: 2 },
        },
        {
          type: "DHT22",
          loc_coord: { x: 3, y: 3 },
        },
      ],
      lightAvailable: true,
      sprinklersAvailable: true,
      sprinklers: [
        { x: 1, y: 1 },
        { x: 1, y: 3 },
        { x: 1, y: 5 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 3, y: 5 },
      ],
    },
    {
      dimensions: { x: 4, y: 6, z: 3 },
      loc_coord: { x: 0, y: 6, z: 0 },
      sensorsAvailable: true,
      sensors: [
        {
          type: "DHT22",
          loc_coord: { x: 3, y: 3 },
        },
      ],
      lightAvailable: true,
      sprinklersAvailable: false,
      sprinklers: null,
    },
    {
      dimensions: { x: 4, y: 8, z: 2 },
      loc_coord: { x: 8, y: 2, z: 0 },
      sensorsAvailable: false,
      sensors: null,
      lightAvailable: true,
      sprinklersAvailable: true,
      sprinklers: [
        { x: 1, y: 1 },
        { x: 1, y: 3 },
        { x: 1, y: 5 },
        { x: 1, y: 7 },
        { x: 3, y: 1 },
        { x: 3, y: 3 },
        { x: 3, y: 5 },
        { x: 3, y: 7 },
      ],
    },
    {
      dimensions: { x: 4, y: 1, z: 2 },
      loc_coord: { x: 4, y: 15, z: 0 },
      sensorsAvailable: true,
      sensors: [
        {
          type: "DHT22",
          loc_coord: { x: 1, y: 1 },
        },
        {
          type: "DHT22",
          loc_coord: { x: 3, y: 1 },
        },
      ],
      lightAvailable: true,
      sprinklersAvailable: false,
      sprinklers: null,
    },
  ],
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
