import { ThreeEvent } from "@react-three/fiber";
import { useContext, useEffect, useState } from "react";
import * as THREE from "three";
import { useSpring, animated, to } from "@react-spring/three";

import { ZoneContext } from "../../../context/ZoneContextProvider";
import { SquareContext } from "../../../context/SquareContextProvider";
import { SquareId } from "../../../../types/common";

type SquareRenderProps = {
  position: [x: number, y: number, z: number];
  args: [x: number, y: number, z: number];
  squareId: SquareId;
  localZoneId: number;
};

export default function SquareRender({
  position,
  args,
  squareId,
  localZoneId,
}: SquareRenderProps) {
  const [hovering, setHovering] = useState<boolean>(false);

  const { selectedSquareId, setSelectedSquareId } = useContext(SquareContext);
  const { inZone, zoneId } = useContext(ZoneContext);

  const spring = useSpring({
    color:
      selectedSquareId === squareId ||
      (localZoneId === zoneId && hovering) ||
      (zoneId === 0 && hovering)
        ? "orange"
        : "green",
    wireframe:
      selectedSquareId === squareId ||
      (localZoneId === zoneId && hovering) ||
      (zoneId === 0 && hovering)
        ? false
        : true,
    position:
      selectedSquareId === squareId ||
      (localZoneId === zoneId && hovering) ||
      (zoneId === 0 && hovering)
        ? [position[0], position[1], position[2] + 0.3]
        : position,
    config: {
      mass: 1, // Mass of the moving object
      tension: 120, // Stiffness of the spring
      friction: 76, // Damping (friction) of the spring
    },
  });

  function pointerEnterEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    // console.log(`Square (${squareId.x}, ${squareId.y}) in Zone ${zoneId}`);
    setHovering(true);
  }
  function pointerLeaveEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setHovering(false);
  }
  function squareClickedHandler(event: ThreeEvent<MouseEvent>) {
    if (inZone) {
      event.stopPropagation();
      if (localZoneId === zoneId) {
        setSelectedSquareId(squareId);
      }
    }
  }

  return (
    <animated.mesh
      onClick={squareClickedHandler}
      onPointerEnter={pointerEnterEventHandler}
      onPointerLeave={pointerLeaveEventHandler}
      position={spring.position.to((x: number, y: number, z: number) => [
        x,
        y,
        z,
      ])}
    >
      <boxGeometry args={args} />
      <animated.meshBasicMaterial
        color={spring.color}
        wireframe={spring.wireframe}
      />
    </animated.mesh>
  );
}
