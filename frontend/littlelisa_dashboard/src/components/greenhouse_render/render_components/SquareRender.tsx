import { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import { MeshBasicMaterial, type Mesh } from "three";
import { useState } from "react";

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
  const squareRef = useRef<Mesh>(null);

  function pointerEnterEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    console.log(`Square (${squareId.x}, ${squareId.y}) in Zone ${zoneId}`);
    const selectedSquare = squareRef.current;
    if (
      selectedSquare &&
      selectedSquare.material instanceof MeshBasicMaterial
    ) {
      selectedSquare.material.color.set("purple");
      selectedSquare.material.wireframe = false;
    }
  }
  function pointerLeaveEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();

    const selectedSquare = squareRef.current;
    if (
      selectedSquare &&
      selectedSquare.material instanceof MeshBasicMaterial
    ) {
      selectedSquare.material.color.set("green");
      selectedSquare.material.wireframe = true;
    }
  }

  return (
    <mesh
      ref={squareRef}
      onPointerEnter={pointerEnterEventHandler}
      onPointerLeave={pointerLeaveEventHandler}
      position={position}
    >
      <boxGeometry args={args} />
      <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
    </mesh>
  );
}
