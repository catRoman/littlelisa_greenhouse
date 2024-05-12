import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { SquareId } from "../../../../../types/common";
import { useState } from "react";
import { Module } from "../../../../../types/common";

type ControllerListRenderProp = {
  controllers: Module[] | null;
  plot_height: number;
  squareId: SquareId;
};

export default function NodeListRender({
  controllers,
  plot_height,
  squareId,
}: ControllerListRenderProp) {
  const [labelHover, setLabelHover] = useState<boolean>(false);

  function sensorEventHandler(
    event: ThreeEvent<MouseEvent>,
    controllerId: number,
  ) {
    event.stopPropagation();
    console.log(`controller ${controllerId} clicked`);
  }
  function sensorLabelEnterHandler() {
    setLabelHover(true);
  }
  function sensorLabelExitHandler() {
    setLabelHover(false);
  }

  if (controllers) {
    return (
      <>
        {controllers.map((controller, index) => {
          const {
            loc_coord: { x: node_x, y: node_y },
          } = controller;
          const boxSides = 0.5;
          const sensorId = index + 1;
          return (
            node_x === squareId.x &&
            node_y === squareId.y && (
              <group
                key={index + 1}
                onClick={(event) => sensorEventHandler(event, sensorId)}
                onPointerEnter={sensorLabelEnterHandler}
                onPointerLeave={sensorLabelExitHandler}
                position={[0, 0, plot_height / 2 + boxSides]}
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
                    position={[0, 0, boxSides * 6]}
                  >
                    <p>Node</p>
                  </Html>
                )}

                <mesh>
                  <boxGeometry args={[boxSides, boxSides, boxSides]} />
                  <meshBasicMaterial
                    args={[{ color: "white", wireframe: true }]}
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
