import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { PresentationControls, PerspectiveCamera } from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { CameraSettings, GreenhouseData } from "../../../types/common";
import { useControls } from "leva";
import { ZoneContext } from "../../context/ZoneContextProvider";
import { useFrame } from "@react-three/fiber";
import { zoneCameraViews } from "./render_components/data/zoneCameras";
import { useSpring, a } from "@react-spring/three";

type GreenHouseModelProps = {
  model_info: GreenhouseData;
  enableControls: boolean;
  setEnableControls: React.Dispatch<React.SetStateAction<boolean>>;
  zoneZoom: boolean;
  initialCameraSettings: CameraSettings;
  setZoneZoom: React.Dispatch<React.SetStateAction<boolean>>;
  cameraSettings: CameraSettings;
  setCameraSettings: React.Dispatch<React.SetStateAction<CameraSettings>>;
};

export default function GreenHouseModel({
  model_info,
  enableControls,
  setEnableControls,
  zoneZoom,
  setZoneZoom,
  initialCameraSettings,
  cameraSettings,
  setCameraSettings,
}: GreenHouseModelProps) {
  const sceneRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const {
    greenhouse: { dimensions },
  } = model_info;

  // Component to add axes helper

  //===============LERA==============
  // Leva panel to adjust the camera
  const cameraControls = useControls("Camera", {
    fov: { value: cameraSettings.fov, min: 10, max: 100 },
    near: { value: cameraSettings.near, min: 0.01, max: 100 },
    far: { value: cameraSettings.far, min: 1, max: 2000 },
    positionX: {
      value: cameraSettings.position.x,
      min: -100,
      max: 100,
      step: 0.1,
    },
    positionY: {
      value: cameraSettings.position.y,
      min: -100,
      max: 100,
      step: 0.1,
    },
    positionZ: {
      value: cameraSettings.position.z,
      min: -100,
      max: 100,
      step: 0.1,
    },
    rotationX: {
      value: cameraSettings.rotation.x,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    rotationY: {
      value: cameraSettings.rotation.y,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
    rotationZ: {
      value: cameraSettings.rotation.z,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    },
  });

  // Update camera settings based on controls
  // Update camera settings based on controls
  useEffect(() => {
    const newPosition = new THREE.Vector3(
      cameraControls.positionX,
      cameraControls.positionY,
      cameraControls.positionZ,
    );
    const newRotation = new THREE.Euler(
      cameraControls.rotationX,
      cameraControls.rotationY,
      cameraControls.rotationZ,
    );
    setCameraSettings((prev) => ({
      ...prev,
      fov: cameraControls.fov,
      near: cameraControls.near,
      far: cameraControls.far,
      position: newPosition,
      rotation: newRotation,
    }));
  }, [cameraControls, setCameraSettings]);

  //==========================

  const { zoneId } = useContext(ZoneContext);
  useFrame((state) => {
    if (zoneId) {
      // Do something with the zonePosition, e.g., log it, update UI, etc.
      // console.log(
      //   JSON.stringify({
      //     pX: state.camera.position.x,
      //     pY: state.camera.position.y,
      //     pZ: state.camera.position.z,
      //     rX: state.camera.rotation.x,
      //     rY: state.camera.rotation.y,
      //     rZ: state.camera.rotation.z,
      //     zoom: state.camera.zoom,
      //   }),
      // );
      // const newPosition = new Vector3(
      //   zoneCameraViews[zoneId - 1].posX,
      //   zoneCameraViews[zoneId - 1].posY,
      //   zoneCameraViews[zoneId - 1].posZ,
      // );
      // state.camera.lookAt(newPosition);
    }
  });

  useEffect(() => {
    if (zoneId) {
      // Do something with the zonePosition, e.g., log it, update UI, etc.

      const newPosition = new THREE.Vector3(
        zoneCameraViews[zoneId - 1].posX,
        zoneCameraViews[zoneId - 1].posY,
        zoneCameraViews[zoneId - 1].posZ,
      );
      const newRotation = new THREE.Euler(
        zoneCameraViews[zoneId - 1].rotX,
        zoneCameraViews[zoneId - 1].rotY,
        zoneCameraViews[zoneId - 1].rotZ,
      );

      setCameraSettings((prev) => ({
        ...prev,
        rotation: newRotation,
        position: newPosition,
      }));

      setZoneZoom(true);
      setEnableControls(false);
    }
  }, [zoneId, setEnableControls, setZoneZoom, setCameraSettings]);

  useFrame(() => {
    if (cameraRef.current) {
      const delta = 0.05;
      // console.log("cameraSettings inside useFrame:", cameraSettings.position);
      cameraRef.current.position.lerp(cameraSettings.position, delta);
      if (
        cameraRef.current.position.distanceTo(cameraSettings.position) < 0.1
      ) {
        //animation done
      }
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={initialCameraSettings.fov}
        // zoom={10}
        near={initialCameraSettings.near}
        far={initialCameraSettings.far}
        position={initialCameraSettings.position}
        rotation={initialCameraSettings.rotation}
      />

      {/* <OrbitControls makeDefault zoomToCursor /> */}
      <PresentationControls
        //ref={cameraRef}
        enabled={enableControls}
        snap
        global
        zoom={0.8}
        //rotation={[-(Math.PI / 2), 0, 0]}
        //rotation={[-(Math.PI / 2), 0, 0]}
        rotation={[0, -(Math.PI / 4), 0]}
        polar={[0, -Math.PI / 4]}
        azimuth={[-Math.PI, 0]}
        config={{ mass: 1, tension: 170, friction: 75 }}
      >
        <group
          position={[-(dimensions.x / 2), 0, dimensions.y / 2]}
          ref={sceneRef}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <GreenHouseRender dimensions={dimensions} />

          {model_info.zones.map((zone, index) => {
            const localZoneId = index + 1;

            return (
              <ZoneRender
                zone={zone}
                key={`zone${index + 1}`}
                localZoneId={localZoneId}
              />
            );
          })}
        </group>
      </PresentationControls>
    </>
  );
}
