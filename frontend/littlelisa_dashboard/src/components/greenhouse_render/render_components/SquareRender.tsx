import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useContext, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { SquareContext } from "../../../context/SquareContextProvider";
import { SquareId } from "../../../../types/common";
import { zoneCameraViews } from "./data/zoneCameras";

type SquareRenderProps = {
  position: [x: number, y: number, z: number];
  args: [x: number, y: number, z: number];
  squareId: SquareId;
  localZoneId: number;
  squareSelectedRef: React.MutableRefObject<boolean>;
};

export default function SquareRender({
  position,
  args,
  squareId,
  localZoneId,
  squareSelectedRef,
}: SquareRenderProps) {
  const zoomOut = useRef<boolean>(true);
  const currentZoneCameraRef = useRef<{
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
  }>(null!);
  const [hovering, setHovering] = useState<boolean>(false);
  const [cameraSquarePosition, setCameraSquarePosition] =
    useState<THREE.Vector3>(null!);
  const [cameraSquareRotation, setCameraSquareRotation] =
    useState<THREE.Quaternion>(null!);
  const [animationDone, setAnimationDone] = useState<boolean>(false);
  const { camera: sceneCamera } = useThree();
  const { selectedSquareId, setSelectedSquareId } = useContext(SquareContext);
  const { inZone, zoneId, zoneSquareSelected } = useContext(GreenHouseContext);

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
        ? [position[0], position[1], position[2] + 0.5]
        : position,
    config: {
      mass: 1, // Mass of the moving object
      tension: 120, // Stiffness of the spring
      friction: 76, // Damping (friction) of the spring
    },
    onRest: () => {
      if (selectedSquareId === squareId) {
        setAnimationDone(true);
      }
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
    if (inZone && selectedSquareId === null) {
      event.stopPropagation();
      if (localZoneId === zoneId) {
        setSelectedSquareId(squareId);
        zoneSquareSelected.current = true;
        zoomOut.current = false;
        // setZoneSquareSelected(true);
        console.log(`square ${selectedSquareId} in zone ${zoneId}`);

        currentZoneCameraRef.current = {
          position: sceneCamera.position.clone(),
          rotation: sceneCamera.quaternion.clone(),
        };

        const worldPosition = new THREE.Vector3();
        worldPosition.setFromMatrixPosition(event.object.matrixWorld);
        setCameraSquarePosition(worldPosition);
      }
    }
  }
  function pointerMissedHandler(event: MouseEvent) {
    event.stopPropagation();
    if (
      selectedSquareId === squareId &&
      zoneSquareSelected.current &&
      !zoomOut.current
    ) {
      //event.stopPropagation();
      console.log("pointer missed");

      setSelectedSquareId(null);
      zoneSquareSelected.current = false;
      zoomOut.current = true;
      setCameraSquareRotation(currentZoneCameraRef.current.rotation);
      setCameraSquarePosition(currentZoneCameraRef.current.position);
    }
  }
  useFrame((state) => {
    if (cameraSquarePosition && zoneSquareSelected.current) {
      const delta = 0.05;
      const squareView = new THREE.Vector3(
        cameraSquarePosition.x,
        cameraSquarePosition.y + 5,
        -5,
      );

      state.camera.lookAt(cameraSquarePosition);

      state.camera.position.lerp(squareView, delta);
      if (state.camera.position.distanceTo(squareView) < 0.1) {
        console.log("animation done");
      }
    } else if (
      cameraSquarePosition &&
      cameraSquareRotation &&
      !zoneSquareSelected.current &&
      zoomOut.current === true
    ) {
      const delta = 0.5;
      state.camera.quaternion.slerp(cameraSquareRotation, delta);
      state.camera.position.lerp(cameraSquarePosition, delta);

      if (state.camera.position.distanceTo(cameraSquarePosition) < 0.1) {
        console.log("animation done");
        zoomOut.current = false;
      }
    }
  });
  return (
    <animated.mesh
      onClick={squareClickedHandler}
      onPointerEnter={pointerEnterEventHandler}
      onPointerLeave={pointerLeaveEventHandler}
      onPointerMissed={pointerMissedHandler}
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
