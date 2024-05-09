import React, { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { PresentationControls, PerspectiveCamera } from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { CameraSettings, GreenhouseData } from "../../../types/common";
import { GreenHouseContext } from "../../context/GreenHouseContextProvider";
import { useFrame } from "@react-three/fiber";
import { zoneCameraViews } from "./render_components/data/zoneCameras";

type GreenHouseModelProps = {
  squareSelectedRef: React.MutableRefObject<boolean>;
  model_info: GreenhouseData;
  enableControls: boolean;
  setEnableControls: React.Dispatch<React.SetStateAction<boolean>>;
  initialCameraSettings: CameraSettings;
  cameraSettings: CameraSettings;
  setCameraSettings: React.Dispatch<React.SetStateAction<CameraSettings>>;
};

export default function GreenHouseModel({
  model_info,
  squareSelectedRef,
  enableControls,
  setEnableControls,
  initialCameraSettings,
  cameraSettings,
  setCameraSettings,
}: GreenHouseModelProps) {
  const sceneRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const {
    greenhouse: { dimensions },
  } = model_info;

  const { zoneId } = useContext(GreenHouseContext);

  useEffect(() => {
    if (zoneId) {
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

      setEnableControls(false);
    }
  }, [zoneId, setEnableControls, setCameraSettings]);

  useFrame(() => {
    if (cameraRef.current) {
      const delta = 0.05;
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

      <PresentationControls
        enabled={enableControls}
        snap
        global
        zoom={0.8}
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
                squareSelectedRef={squareSelectedRef}
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
