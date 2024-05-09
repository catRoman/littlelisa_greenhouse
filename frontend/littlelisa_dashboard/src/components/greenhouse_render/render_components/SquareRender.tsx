import { ThreeEvent } from "@react-three/fiber";
import { useContext, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
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

  const {
    inZone,
    selectedZoneId,
    setSelectedSquareId,
    selectedSquareId,
    previousCameraProperties,

    setCurrentCameraProperties,
  } = useContext(GreenHouseContext);

  const spring = useSpring({
    color:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneId) ||
      (localZoneId === selectedZoneId && hovering) ||
      (selectedZoneId === 0 && hovering)
        ? "orange"
        : "green",
    wireframe:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneId) ||
      (localZoneId === selectedZoneId && hovering) ||
      (selectedZoneId === 0 && hovering)
        ? false
        : true,
    position:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneId) ||
      (localZoneId === selectedZoneId && hovering) ||
      (selectedZoneId === 0 && hovering)
        ? [position[0], position[1], position[2] + 0.5]
        : position,
    config: {
      mass: 1, // Mass of the moving object
      tension: 120, // Stiffness of the spring
      friction: 76, // Damping (friction) of the spring
    },
  });

  function pointerEnterEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setHovering(true);
  }
  function pointerLeaveEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    setHovering(false);
  }
  function squareClickedHandler(event: ThreeEvent<MouseEvent>) {
    if (inZone.current) event.stopPropagation();
    if (localZoneId === selectedZoneId) {
      setSelectedSquareId(squareId);

      const worldPosition = new THREE.Vector3();
      worldPosition.setFromMatrixPosition(event.object.matrixWorld);

      //equivalent to lookat thanks chat - linear-algebra not today lol
      const newPosition = new THREE.Vector3(
        worldPosition.x,
        worldPosition.y + position[2] + 4,
        worldPosition.z + 5,
      );
      setCurrentCameraProperties({
        fov: 35,
        zoom: 1,
        near: 0.1,
        far: 5000,
        rotation: previousCameraProperties.current.rotation,
        position: newPosition,
      });
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
