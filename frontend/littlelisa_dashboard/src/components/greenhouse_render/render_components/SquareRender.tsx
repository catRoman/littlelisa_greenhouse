import { ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MeshBasicMaterial, type Mesh } from "three";
import { useSpring, animated } from "@react-spring/three";

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
  const squareRef = useRef<Mesh>(null!);

  const [spring, setSpring] = useSpring(() => ({
    scale: 1,
  }));

  function pointerEnterEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    console.log(`Square (${squareId.x}, ${squareId.y}) in Zone ${zoneId}`);
    const selectedSquare = squareRef.current;
    if (selectedSquare) {
      setSpring({ scale: 1.5 });

      // selectedSquare.material.color.set("purple");
      //selectedSquare.material.wireframe = false;
    }
  }
  function pointerLeaveEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();

    const selectedSquare = squareRef.current;
    if (selectedSquare) {
      setSpring({ scale: 1 });

      //selectedSquare.material.color.set("green");
      //selectedSquare.material.wireframe = true;
    }
  }

  return (
    <animated.mesh
      scale={spring.scale}
      ref={squareRef}
      onPointerEnter={pointerEnterEventHandler}
      onPointerLeave={pointerLeaveEventHandler}
      position={position}
    >
      <boxGeometry args={args} />
      <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
    </animated.mesh>
  );
}
