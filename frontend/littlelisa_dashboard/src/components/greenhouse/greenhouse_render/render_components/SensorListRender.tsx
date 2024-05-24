import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { Sensor, SquareId } from "../../../../../types/common";
import { useContext, useState } from "react";
import { GreenHouseContext } from "../../../../context/GreenHouseContextProvider";

type SensorListRenderProp = {
  sensors: Sensor[] | null;
  plot_height: number;
  localZoneId: number;
  squareId: SquareId;
};

export default function SensorListRender({
  sensors,
  localZoneId,
  plot_height,
  squareId,
}: SensorListRenderProp) {
  const [labelHover, setLabelHover] = useState<boolean>(false);
  const { fetchedGreenhouseData } = useContext(GreenHouseContext);

  function sensorEventHandler(event: ThreeEvent<MouseEvent>, sensorId: number) {
    event.stopPropagation();
    console.log(`zone ${localZoneId} sensor ${sensorId} clicked`);
  }
  function sensorLabelEnterHandler() {
    setLabelHover(true);
  }
  function sensorLabelExitHandler() {
    setLabelHover(false);
  }

  if (sensors) {
    return (
      <>
        {sensors.map((sensor, index) => {
          let sensor_x;
          let sensor_y;
          if (sensor.zn_rel_pos) {
            sensor_x = sensor.zn_rel_pos.x;
            sensor_y = sensor.zn_rel_pos.y;
          }

          if (squareId) {
            if (sensor.square_pos) {
              sensor_x = sensor.square_pos.x;
              sensor_y = sensor.square_pos.y;
            }
          }

          const sphereRadius = 0.1;
          const sensorId = index + 1;
          return (
            sensor_x ===
              squareId.x +
                fetchedGreenhouseData!.zones[localZoneId].zone_start_point.x &&
            sensor_y ===
              squareId.y +
                fetchedGreenhouseData!.zones[localZoneId].zone_start_point
                  .y && (
              <group
                key={index + 1}
                onClick={(event) => sensorEventHandler(event, sensorId)}
                onPointerEnter={sensorLabelEnterHandler}
                onPointerLeave={sensorLabelExitHandler}
                position={[0, 0, plot_height / 2 + sphereRadius]}
              >
                {labelHover && (
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
                )}

                <mesh>
                  <sphereGeometry args={[sphereRadius, 8, 4]} />
                  <meshBasicMaterial
                    args={[{ color: "red", wireframe: true }]}
                  />
                </mesh>
              </group>
            )
          );
        })}
      </>
    );
  }

  return <></>;
}
