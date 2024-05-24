import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { SquareId } from "../../../../types/common";
import { useState } from "react";
import { Module } from "../../../../types/common";

type NodeListRenderProp = {
  nodes: Module[] | null;
  plot_height: number;
  squareId: SquareId;
};

export default function NodeListRender({
  nodes,
  plot_height,
  squareId,
}: NodeListRenderProp) {
  const [labelHover, setLabelHover] = useState<boolean>(false);

  function sensorEventHandler(
    event: ThreeEvent<MouseEvent>,
    nodeId: number,
    nodeName: string,
  ) {
    event.stopPropagation();
    console.log(`node ${nodeId} -> ${nodeName} clicked`);
  }
  function sensorLabelEnterHandler() {
    setLabelHover(true);
  }
  function sensorLabelExitHandler() {
    setLabelHover(false);
  }

  if (nodes) {
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
          const boxSides = 0.1;
          const nodeId = index + 1;
          return (
            node_x === squareId.x &&
            node_y === squareId.y && (
              <group
                key={index + 1}
                onClick={(event) =>
                  sensorEventHandler(event, nodeId, node.module_id)
                }
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
                    args={[{ color: "purple", wireframe: true }]}
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
