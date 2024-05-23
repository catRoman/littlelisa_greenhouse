import { useContext, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PresentationControls, PerspectiveCamera } from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { GreenhouseData, ZoneData } from "../../../../types/common";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { zoneCameraViews } from "./render_components/data/zoneCameras";
import { useSpring, animated } from "@react-spring/three";

type GreenHouseModelProps = {
  model_info: GreenhouseData;
};

export default function GreenHouseModel({ model_info }: GreenHouseModelProps) {
  const sceneRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const { dimensions } = model_info;

  const {
    selectedZoneId,
    enableControls,
    previousCameraProperties,
    setCurrentCameraProperties,
    currentCameraProperties,
  } = useContext(GreenHouseContext);

  const [zoneData, setZoneData] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZoneData = async () => {
      const url = "/api/users/1/greenhouses/1/zones";

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setZoneData(data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        if (error instanceof Error) {
          setError(error.message);
        }
        setLoading(false);
      }
    };

    fetchZoneData();
  }, []);

  useEffect(() => {
    if (selectedZoneId) {
      const newPosition = new THREE.Vector3(
        zoneCameraViews[selectedZoneId - 1].posX,
        zoneCameraViews[selectedZoneId - 1].posY,
        zoneCameraViews[selectedZoneId - 1].posZ,
      );
      const newRotation = new THREE.Euler(
        zoneCameraViews[selectedZoneId - 1].rotX,
        zoneCameraViews[selectedZoneId - 1].rotY,
        zoneCameraViews[selectedZoneId - 1].rotZ,
      );

      setCurrentCameraProperties({
        fov: 35,
        zoom: 1,
        near: 0.1,
        far: 5000,
        rotation: newRotation,
        position: newPosition,
      });
      // console.log(`zone clicked: ${selectedZoneId}`);
      enableControls.current = false;
    }
  }, [selectedZoneId, enableControls, setCurrentCameraProperties]);

  const { pos, rot } = useSpring({
    to: {
      pos: currentCameraProperties.position.toArray(),
      rot: currentCameraProperties.rotation,
    },
    from: {
      pos: previousCameraProperties.current.position.toArray(),
      rot: previousCameraProperties.current.rotation,
    },
    reset: false,
    config: { mass: 1, tension: 1, friction: 1, duration: 1000 },
  });

  useEffect(() => {
    console.log("Updated zones state:");
  }, [zoneData]);

  if (loading) {
    console.log("loading: ", loading);
  }

  if (error) {
    console.log("error: ", loading);
  }

  return (
    <>
      <animated.group position={pos} rotation={rot}>
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          fov={currentCameraProperties.fov}
          near={currentCameraProperties.near}
          far={currentCameraProperties.far}
        />
      </animated.group>

      <PresentationControls
        enabled={enableControls.current}
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

          {/* skip global zone */}
          {zoneData!.slice(1).map((zone) => {
            return (
              <ZoneRender
                zone={zone}
                key={`zone${zone.zone_number}`}
                localZoneId={zone.zone_number}
              />
            );
          })}
        </group>
      </PresentationControls>
    </>
  );
}
