import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { Sensor } from "../../../../types/common";

type SensorListRenderProp = {
  sensors: Sensor[] | null;
  zone_dim: {
    x: number;
    y: number;
    z: number;
  };
  zoneId: number;
};

export default function SensorListReader({
  sensors,
  zoneId,
  zone_dim,
}: SensorListRenderProp) {
  function sensorEventHandler(event: ThreeEvent<MouseEvent>, sensorId: number) {
    event.stopPropagation();
    console.log(`zone ${zoneId} sensor ${sensorId} clicked`);
  }

  if (sensors) {
    return (
      <>
        {sensors.map((sensor, index) => {
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
                sensor_x - zone_dim.x / 2 - 0.5,
                sensor_y - zone_dim.y / 2 - 0.5,
                zone_dim.z / 2 + sphereRadius,
              ]}
            >
              <Html
                style={{
                  userSelect: "none",
                  borderRadius: "0.375rem",
                  backgroundColor: "rgba(59, 131, 246, 0.623)", // blue-500 with 45% opacity
                  padding: "0.25rem",
                  fontSize: "0.875rem",
                  color: "#ff0080",
                }}
                // className="rounded-md bg-blue-500 bg-opacity-45 p-1 text-sm text-red-100"
                center
                sprite
                distanceFactor={10}
                position={[0, 0, sphereRadius * 6]}
              >
                <p>{sensor.type}</p>
              </Html>

              <mesh>
                <sphereGeometry args={[sphereRadius, 8, 4]} />
                <meshBasicMaterial args={[{ color: "red", wireframe: true }]} />
              </mesh>
            </group>
          );
        })}
      </>
    );
  }

  return <></>;
}
