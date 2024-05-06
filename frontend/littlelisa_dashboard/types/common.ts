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

export type ZoneRenderProps = {
  zone: ZoneData;
  zoneId: number;
};
