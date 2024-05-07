import { useContext, useEffect, useRef, useState } from "react";
import { Euler, Vector3, type Group } from "three";
import {
  PresentationControls,
  PerspectiveCamera,
  OrbitControls,
} from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { GreenhouseData } from "../../../types/common";
import { useControls } from "leva";
import { ZoneContext } from "../../context/ZoneContextProvider";
import { useFrame } from "@react-three/fiber";
import { zoneCameraViews } from "./render_components/data/zoneCameras";

type GreenHouseModelProps = {
  model_info: GreenhouseData;
};

export default function GreenHouseModel({ model_info }: GreenHouseModelProps) {
  const sceneRef = useRef<Group>(null!);
  const cameraRef = useRef(null!);
  const [enableControls, setEnableControls] = useState(true);
  const {
    greenhouse: { dimensions },
  } = model_info;

  // Component to add axes helper
  const initalCameraSettings = {
    fov: 35,
    //zoom: null,
    near: 0.1,
    far: 5000,
    position: new Vector3(0, 10, 16),
    rotation: new Euler(-0.5, 0, 0),
  };

  const [cameraSettings, setCameraSettings] = useState(initalCameraSettings);

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
    const newPosition = new Vector3(
      cameraControls.positionX,
      cameraControls.positionY,
      cameraControls.positionZ,
    );
    const newRotation = new Euler(
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
  }, [cameraControls]);

  //==========================

  const { zoneId } = useContext(ZoneContext);
  // useFrame((state) => {
  //   if (zoneId) {
  //     // Do something with the zonePosition, e.g., log it, update UI, etc.
  //     // console.log(
  //     //   JSON.stringify({
  //     //     pX: state.camera.position.x,
  //     //     pY: state.camera.position.y,
  //     //     pZ: state.camera.position.z,
  //     //     rX: state.camera.rotation.x,
  //     //     rY: state.camera.rotation.y,
  //     //     rZ: state.camera.rotation.z,
  //     //     zoom: state.camera.zoom,
  //     //   }),
  //     // );
  //     const newPosition = new Vector3(
  //       zoneCameraViews[zoneId - 1].posX,
  //       zoneCameraViews[zoneId - 1].posY,
  //       zoneCameraViews[zoneId - 1].posZ,
  //     );
  //     state.camera.lookAt(newPosition);
  //   }
  // });

  // useEffect(() => {
  //   if (zoneId) {
  //     // Do something with the zonePosition, e.g., log it, update UI, etc.
  //     //console.log("Selected zone position:", zonePosition);
  //     console.log("Selected Zone: ", zoneId);
  //     const newPosition = new Vector3(
  //       zoneCameraViews[zoneId - 1].posX,
  //       zoneCameraViews[zoneId - 1].posY,
  //       zoneCameraViews[zoneId - 1].posZ,
  //     );
  //     const newRotation = new Euler(
  //       zoneCameraViews[zoneId - 1].rotX,
  //       zoneCameraViews[zoneId - 1].rotY,
  //       zoneCameraViews[zoneId - 1].rotZ,
  //     );
  //     state.
  //     // setCameraSettings((prev) => ({
  //     //   ...prev,
  //     //   position: newPosition,
  //     //   rotation: newRotation,
  //     // }));
  //   }
  // }, [zoneId]);

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={cameraSettings.fov}
        // zoom={10}
        near={cameraSettings.near}
        far={cameraSettings.far}
        position={cameraSettings.position}
        rotation={cameraSettings.rotation}
      />

      {/* <OrbitControls makeDefault zoomToCursor /> */}
      <PresentationControls
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
            const zoneId = index + 1;
            return (
              <ZoneRender
                zone={zone}
                key={`zone${index + 1}`}
                zoneId={zoneId}
              />
            );
          })}
        </group>
      </PresentationControls>
    </>
  );
}
