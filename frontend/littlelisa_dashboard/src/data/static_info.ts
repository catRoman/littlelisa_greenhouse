import { cntrlDataType } from "../../types/common";

//TODO:Types for json data

export const current_enviromental = {
  fans: true,
  lights: false,
  water: false,
  vents: true,
  fertilizers: false,
};

export const greenhouse_data = {
  greenhouse: {
    lat: 48.42,
    long: -123.53,
    greenhouse_id: 1,
    greenhouse_location_str: "backyard",
    type: "half tunnel",
    dimensions: { x: 12, y: 16 },
    total_zones: 4,
    total_sensors: 3,
    total_controllers: 1,
    controllers: [
      {
        moduleId: "d4:h1:y7:i6:e2:4b",
        loc_coord: { x: 6, y: 6 },
      },
    ],
  },
  zones: [
    {
      name: "leafy greens",
      description:
        "Blah blah blah this is a general descirption that may not be nesesary",
      dimensions: { x: 4, y: 6, z: 2 },
      loc_coord: { x: 0, y: 0, z: 0 },
      sensorsAvailable: true,
      nodes: [
        { moduleId: "h4:6g:d1:4r:f7:2d", loc_coord: { x: 1, y: 1 } },
        { moduleId: "g4:6w:d6:4q:d7:6d", loc_coord: { x: 2, y: 2 } },
      ],
      sensors: [
        {
          node: "h4:6g:d1:4r:f7:2d",
          type: "DHT22",
          loc_coord: { x: 1, y: 2 },
        },
        {
          node: "g4:6w:d6:4q:d7:6d",
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
      lastest_enviro: {
        water: "2024-04-11 03:38:03",
        fert: "2024-04-11 03:38:03",
        light_period: {
          period: "Daily",
          on: "04:00",
          off: "16:00",
        },
      },
    },
    {
      name: "root vegtables",
      description:
        "Blah blah blah this is a general descirption that may not be nesesary",
      dimensions: { x: 4, y: 6, z: 3 },
      loc_coord: { x: 0, y: 6, z: 0 },
      sensorsAvailable: true,
      nodes: [{ moduleId: "j6:s8:3h:j5:k1:9j", loc_coord: { x: 1, y: 1 } }],
      sensors: [
        {
          node: "j6:s8:3h:j5:k1:9j",
          type: "DHT22",
          loc_coord: { x: 3, y: 3 },
        },
      ],
      lightAvailable: true,
      sprinklersAvailable: false,
      sprinklers: null,
      lastest_enviro: {
        water: "2024-04-16 02:30:03",
        fert: "2024-04-12 05:00:03",
        light_period: {
          period: "M-F",
          on: "08:00",
          off: "12:00",
        },
      },
    },
    {
      name: "fruting plants and herbs",
      description:
        "Blah blah blah this is a general descirption that may not be nesesary",
      dimensions: { x: 4, y: 8, z: 2 },
      loc_coord: { x: 8, y: 2, z: 0 },
      sensorsAvailable: false,
      sensors: null,
      lightAvailable: false,
      sprinklersAvailable: true,
      nodes: null,
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
      lastest_enviro: {
        water: "2024-04-12 16:00:03",
        fert: "2024-04-14 08:38:03",
        light_period: null,
      },
    },
    {
      name: "climbing vines plants",
      description:
        "Blah blah blah this is a general descirption that may not be nesesary",
      dimensions: { x: 4, y: 1, z: 2 },
      loc_coord: { x: 4, y: 15, z: 0 },
      sensorsAvailable: true,
      nodes: [{ moduleId: "n6:2d:f5:g7:z1:8", loc_coord: { x: 2, y: 0 } }],
      sensors: [
        {
          node: "n6:2d:f5:g7:z1:8",
          type: "DHT22",
          loc_coord: { x: 0, y: 0 },
        },
        {
          node: "n6:2d:f5:g7:z1:8",
          type: "DHT22",
          loc_coord: { x: 3, y: 0 },
        },
      ],
      lightAvailable: true,
      sprinklersAvailable: false,
      sprinklers: null,
      lastest_enviro: {
        water: "2024-04-10 06:18:03",
        fert: "2024-04-10 06:38:03",
        light_period: {
          period: "Daily",
          on: "12:00",
          off: "16:00",
        },
      },
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
