import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";
import { Text, Billboard, Html } from "@react-three/drei";

type Coordinate = {
  x: number;
  y: number;
  z: number; // Optional property
};
type SpaceCoordinate = {
  x: number;
  y: number;
};

type Sensor = {
  type: string;
  loc_coord: SpaceCoordinate;
};

type ZoneData = {
  dimensions: Coordinate;
  loc_coord: Coordinate;
  sensorsAvailable: boolean;
  sensors: Sensor[] | null;
  lightAvailable: boolean;
  sprinklersAvailable: boolean;
  sprinklers: SpaceCoordinate[] | null;
};

type ZoneRenderProps = {
  zone: ZoneData;
  zoneId: number;
};

export default function ZoneRender({ zone, zoneId }: ZoneRenderProps) {
  const {
    loc_coord,
    dimensions: { x: zone_x, y: zone_y, z: zone_z },
    sensors,
    sprinklers,
  } = zone;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    console.log(`zone ${zoneId} clicked`);
  }
  function sensorEventHandler(event: ThreeEvent<MouseEvent>, sensorId: number) {
    event.stopPropagation();
    console.log(`zone ${zoneId} sensor ${sensorId} clicked`);
  }
  function sprinklerEventHandler(
    event: ThreeEvent<MouseEvent>,
    sprinklerId: number,
  ) {
    event.stopPropagation();
    console.log(`zone ${zoneId} sprinkler ${sprinklerId} clicked`);
  }

  return (
    <group
      onClick={zoneEventHandler}
      position={
        new Vector3(
          loc_coord.x + zone_x / 2,
          loc_coord.y + zone_y / 2,
          loc_coord.z + zone_z / 2,
        )
      }
    >
      <mesh>
        <boxGeometry args={[zone_x, zone_y, zone_z, zone_x, zone_y, zone_z]} />
        <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
      </mesh>
      {sensors &&
        sensors.map((sensor, index) => {
          const {
            loc_coord: { x: sensor_x, y: sensor_y },
          } = sensor;
          const sphereRadius = 0.1;
          const sensorId = index + 1;
          return (
            <group
              key={index + 1}
              onClick={(event) => sensorEventHandler(event, sensorId)}
              position={[
                sensor_x - zone_x / 2 - 0.5,
                sensor_y - zone_y / 2 - 0.5,
                zone_z / 2 + sphereRadius,
              ]}
            >
              <Html
                style={{ userSelect: "none" }}
                className="rounded-md bg-blue-500  bg-opacity-45 p-1 text-sm"
                center
                sprite
                distanceFactor={0.01}
                position={[0, 0, sphereRadius * 4]}
              >
                <p>{sensor.type}</p>
              </Html>
              {/* <Text
                rotation={[Math.PI / 2, Math.PI / 4, 0]}
                color="yellow"
                fontSize={0.4}
                fontWeight="bold"
                anchorX="center"
                anchorY={-0.7}
              >
                {sensor.type}
              </Text> */}

              <mesh>
                <sphereGeometry args={[sphereRadius, 8, 4]} />
                <meshBasicMaterial args={[{ color: "red", wireframe: true }]} />
              </mesh>
            </group>
          );
        })}
      {sprinklers &&
        sprinklers.map((sprinklers, index) => {
          const { x: sprinkler_x, y: sprinkler_y } = sprinklers;
          const coneHeight = 0.5;
          const sprinklerId = index + 1;
          return (
            <mesh
              key={index + 1}
              onClick={(event) => sprinklerEventHandler(event, sprinklerId)}
              position={[
                sprinkler_x - zone_x / 2,
                sprinkler_y - zone_y / 2,
                zone_z / 2 + coneHeight / 2,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[0.1, coneHeight, 8, 4]} />
              <meshBasicMaterial args={[{ color: "blue", wireframe: true }]} />
            </mesh>
          );
        })}
    </group>
  );
}
