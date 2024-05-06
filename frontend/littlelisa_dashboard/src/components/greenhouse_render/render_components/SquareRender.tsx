import { ThreeEvent } from "@react-three/fiber";
import { useState } from "react";

import { useSpring, animated, to } from "@react-spring/three";
import { Vector3 } from "three";

type SquareRenderProps = {
  position: [x: number, y: number, z: number];
  args: [x: number, y: number, z: number];
  squareId: { x: number; y: number };
  zoneId: number;
};

export default function SquareRender({
  position,
  args,
  squareId,
  zoneId,
}: SquareRenderProps) {
  const [selected, setSelected] = useState(false);

  const spring = useSpring({
    color: selected ? "orange" : "green",
    wireframe: selected ? false : true,
    position: selected
      ? [position[0], position[1], position[2] + 0.5]
      : position,
    config: {
      mass: 1, // Mass of the moving object
      tension: 120, // Stiffness of the spring
      friction: 126, // Damping (friction) of the spring
    },
  });

  function pointerEnterEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    console.log(`Square (${squareId.x}, ${squareId.y}) in Zone ${zoneId}`);
    setSelected(true);
  }
  function pointerLeaveEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setSelected(false);
  }

  return (
    <animated.mesh
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
