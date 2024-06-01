import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { SquareId } from "../../../../types/common";
import { useContext, useState } from "react";
import { Module } from "../../../../types/common";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";

type ModuleListRenderProp = {
  nodes: Module[] | null;
  plot_height: number;
  squareId: SquareId;
  global: boolean;
  controller: boolean;
  localZoneId: number;
};

export default function ModuleListRender({
  nodes,
  plot_height,
  squareId,
  global,
  controller,
  localZoneId,
}: ModuleListRenderProp) {
  const [labelHover, setLabelHover] = useState<boolean>(false);
  const { fetchedGreenhouseData } = useContext(GreenHouseContext);
  function sensorEventHandler(
    event: ThreeEvent<MouseEvent>,
    nodeId: number,
    nodeName: string,
  ) {
    event.stopPropagation();
    if (controller) {
      console.log(`controller ${nodeId} -> ${nodeName} clicked`);
    } else {
      console.log(`node ${nodeId} -> ${nodeName} clicked`);
    }
  }
  function sensorLabelEnterHandler() {
    setLabelHover(true);
  }
  function sensorLabelExitHandler() {
    setLabelHover(false);
  }

  if (nodes) {
    console.log(`(${squareId.x},${squareId.y} ) - `, nodes);
    return (
      <>
        {nodes.map((node, index) => {
          let node_x = -1;
          let node_y = -1;

          if (node.zn_rel_pos) {
            node_x = node.zn_rel_pos.x - 1;
            node_y = node.zn_rel_pos.y - 1;
          } else if (node.square_pos) {
            node_x = node.square_pos.x - 1;
            node_y = node.square_pos.y - 1;
          }
          let boxSides = 0.1;
          const nodeId = index + 1;

          const locCheck =
            node_x ===
              squareId.x +
                fetchedGreenhouseData!.zones[localZoneId].zone_start_point.x &&
            node_y ===
              squareId.y +
                fetchedGreenhouseData!.zones[localZoneId].zone_start_point.y;
          const moduleArgs = controller
            ? { color: "white", wireframe: true }
            : { color: "purple", wireframe: true };
          let x_pos = 0;
          let y_pos = 0;
          let z_pos = plot_height / 2 + boxSides;
          let tagHeight = boxSides * 6;
          if (global) {
            x_pos = squareId.x;
            y_pos = squareId.y;
            z_pos = plot_height;
            boxSides = 0.5;
            tagHeight = boxSides * 2;
          }

          return (
            (global || locCheck) && (
              <group
                key={index + 1}
                onClick={(event) =>
                  sensorEventHandler(event, nodeId, node.module_id)
                }
                onPointerEnter={sensorLabelEnterHandler}
                onPointerLeave={sensorLabelExitHandler}
                position={[x_pos, y_pos, z_pos]}
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
                    position={[0, 0, tagHeight]}
                  >
                    {controller ? <p>Controller</p> : <p>Node</p>}
                  </Html>
                )}

                <mesh>
                  <boxGeometry args={[boxSides, boxSides, boxSides]} />
                  <meshBasicMaterial args={[moduleArgs]} />
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
