import { Euler, Vector3 } from "three";

export type Dimensions = {
  x: number;
  y: number;
  z: number;
};
export type SquarePos = {
  x: number;
  y: number;
};

export type Sensor = {
  sensor_id: number;
  module_id: string;
  local_id: number;
  location: string;
  type: string;
  square_id: number | null;
  zn_rel_pos: Dimensions | undefined;
  square_pos: SquarePos | undefined;
};

export type ZoneData = {
  zone_id: number;
  greenhouse_id: number;
  name: string;
  description: string;
  zone_start_point: SquarePos;
  zone_number: number;
  dimensions: Dimensions;
};
export type ZoneDataFull = ZoneData & {
  sensorAvailable: boolean;
  nodes: Node[] | null;
  sensors: Sensor[] | null;
};
export type Module = {
  module_id: string;
  location: string;
  zone_number: number;
  square_id: number | null;
  zn_rel_pos: Dimensions | undefined;
  square_pos: SquarePos | undefined;
};
export type Controllers = Module & {
  controller_id: number;
};

export type GreenhouseData = {
  greenhouse_id: number;
  name: string;
  location: string;
  user_id: number;
  style: string;
  lat: number;
  long: number;
  dimensions: Dimensions;
  total: {
    zones: number;
    controllers: number;
    nodes: number;
    sensors: number;
  };
  controllers: Controllers[];
  zones: ZoneDataFull[];
  squares: Plot[];
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
  zone_number: number;
  row: number;
  col: number;
  plant_type: string | null;
  date_planted: string | null;
  date_expected_harvest: string | null;
  notes: Note[] | null;
  is_transplanted: boolean;
  is_empty: boolean;
};

export type Note = {
  date: string;
  note: string;
};
export type Node = Module & {
  node_id: number;
};
