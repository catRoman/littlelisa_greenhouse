import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";

type Coordinate = {
  x: number;
  y: number;
  z?: number; // Optional property
};

type Sensor = {
  type: string;
  loc_coord: Coordinate;
};

type ZoneData = {
  dimensions: Coordinate;
  loc_coord: Coordinate;
  sensorsAvailable: boolean;
  sensors: Sensor[] | null;
  lightAvailable: boolean;
  sprinklersAvailable: boolean;
  sprinklers: Coordinate[] | null;
};

type ZoneRenderProps = {
  zone: ZoneData;
  zoneId: number;
};

export default function ZoneRender({ zone, zoneId }: ZoneRenderProps) {
  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    console.log(`zone ${zoneId} clicked`);
  }

  const { loc_coord, dimensions } = zone;
  return (
    <mesh
      onClick={zoneEventHandler}
      position={new Vector3(loc_coord.x, loc_coord.y, loc_coord.z)}
    >
      <boxGeometry />
      <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
    </mesh>
  );
}
