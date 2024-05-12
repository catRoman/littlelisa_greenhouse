import { Euler, Vector3 } from "three";

export type Coordinate = {
  x: number;
  y: number;
  z: number; // Optional property
};
export type SpaceCoordinate = {
  x: number;
  y: number;
};

export type Sensor = {
  node: string;
  type: string;
  loc_coord: SpaceCoordinate;
};

export type ZoneData = {
  dimensions: Coordinate;
  name: string;
  description: string;
  loc_coord: Coordinate;
  sensorsAvailable: boolean;
  nodes: Module[] | null;
  sensors: Sensor[] | null;
  lightAvailable: boolean;
  sprinklersAvailable: boolean;
  sprinklers: SpaceCoordinate[] | null;
  lastest_enviro: {
    water: string;
    fert: string;
    light_period: {
      period: string;
      on: string;
      off: string;
    } | null;
  };
};
export type Module = {
  moduleId: string;
  loc_coord: { x: number; y: number };
};

export type GreenhouseData = {
  greenhouse: {
    lat: number;
    long: number;
    greenhouse_id: number;
    greenhouse_location_str: string;
    dimensions: { x: number; y: number };
    total_zones: number;
    total_controllers: number;
    controllers: Module[];
  };
  zones: ZoneData[];
};
export type CameraSettings = {
  fov: number;
  zoom: number;
  near: number;
  far: number;
  position: Vector3;
  rotation: Euler;
};

export type SquareId = { x: number; y: number };
export type cntrlDataType = {
  cntrl: string;
  currList: {
    zone: number;
    isActive: boolean;
  }[];
  iconPath: string;
};

export type Plot = {
  square_db_id: number;
  zone_id: number;
  row: number;
  column: number;
  plant_type?: string;
  date_planted?: string;
  date_expected_harvest?: string;
  notes?: Note[];
  is_transplanted?: boolean;
  is_empty: boolean;
};

export type Note = {
  date: string;
  note: string;
};
