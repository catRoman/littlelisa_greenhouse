import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useContext, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { ZoneContext } from "../../../context/ZoneContextProvider";
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
  const [hovering, setHovering] = useState<boolean>(false);
  const [cameraSquarePosition, setCameraSquarePosition] =
    useState<THREE.Vector3>(null!);
  const [cameraSquareRotation, setCameraSquareRotation] = useState<THREE.Euler>(
    null!,
  );
  const [animationDone, setAnimationDone] = useState<boolean>(false);
  const { camera: sceneCamera } = useThree();
  const { selectedSquareId, setSelectedSquareId } = useContext(SquareContext);
  const { inZone, zoneId, setZoneSquarePosition, zoneSquareSelected } =
    useContext(ZoneContext);

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
        // setZoneSquareSelected(true);
        console.log(
          `obj pos-> x:${event.object.position.x} y:${event.object.position.y} z:${event.object.position.z}`,
        );

        const worldPosition = new THREE.Vector3();
        worldPosition.setFromMatrixPosition(event.object.matrixWorld);
        setCameraSquarePosition(worldPosition);
      }
    }
  }
  function pointerMissedHandler(event: MouseEvent) {
    // event.stopPropagation();
    if (selectedSquareId === squareId) {
      //event.stopPropagation();
      console.log("pointer missed");
      //console.log(zoneCameraViews);
      // const zoneCam = zoneCameraViews[localZoneId - 1];
      // const zonePosition = new THREE.Vector3(
      //   zoneCam.posX,
      //   zoneCam.posY,
      //   zoneCam.posZ,
      // );
      const test = new THREE.Vector3(0, 0, 0);
      const testRot = new THREE.Euler(0, 0, -0.5);

      setCameraSquareRotation(testRot);
      setCameraSquarePosition(test);

      // const zoneRotation = new THREE.Euler(
      //   zoneCam.rotX,
      //   zoneCam.rotY,
      //   zoneCam.rotZ,
      // );
      // setCameraSquareRotation(zoneRotation);
      //sceneCamera.lookAt(0, 0, 0);
    }
  }
  useFrame((state) => {
    if (cameraSquareRotation) {
      const delta = 0.5;
      state.camera.position.lerp(cameraSquareRotation, delta);
    }
    if (cameraSquarePosition) {
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
      // console.log(
      //   `current camer pos-> x:${state.camera.position.x} y:${state.camera.position.y} z:${state.camera.position.z}`,
      // );
      // console.log(
      //   `square  pos for cam-> x:${squareView.x} y:${squareView.y} z:${squareView.z}`,
      // );
      // console.log("");
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
