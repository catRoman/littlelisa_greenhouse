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
  type: string;
  loc_coord: SpaceCoordinate;
};

export type ZoneData = {
  dimensions: Coordinate;
  loc_coord: Coordinate;
  sensorsAvailable: boolean;
  sensors: Sensor[] | null;
  lightAvailable: boolean;
  sprinklersAvailable: boolean;
  sprinklers: SpaceCoordinate[] | null;
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
  };
  zones: {
    dimensions: { x: number; y: number; z: number };
    loc_coord: { x: number; y: number; z: number };
    sensorsAvailable: boolean;
    sensors: { type: string; loc_coord: { x: number; y: number } }[] | null;
    lightAvailable: boolean;
    sprinklersAvailable: boolean;
    sprinklers: { x: number; y: number }[] | null;
  }[];
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
