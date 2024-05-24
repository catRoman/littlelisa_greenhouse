import React, { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { PresentationControls, PerspectiveCamera } from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { zoneCameraViews } from "./render_components/data/zoneCameras";
import { useSpring, animated } from "@react-spring/three";
import SensorListRender from "./render_components/SensorListRender";

export default function GreenHouseModel() {
  const sceneRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const greenhouseData = useContext(GreenHouseContext);
  const { fetchedGreenhouseData } = greenhouseData;

  const {
    selectedZoneId,
    enableControls,
    previousCameraProperties,
    setCurrentCameraProperties,
    currentCameraProperties,
  } = useContext(GreenHouseContext);

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

  const { dimensions, zones } = fetchedGreenhouseData!;
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
          {fetchedGreenhouseData && (
            <>
              {fetchedGreenhouseData.zones[0].sensors?.map((sensor) => {
                return (
                  <SensorListRender
                    key={`${sensor.zn_rel_pos?.x}-${sensor.zn_rel_pos?.y}-${sensor.zn_rel_pos?.z}`} // Unique key for each SensorListRender
                    sensors={fetchedGreenhouseData.zones[0].sensors}
                    localZoneId={0}
                    plot_height={
                      // sensor.zn_rel_pos!.z
                      0
                    } // Assuming this is intentional
                    squareId={{
                      // x: sensor.zn_rel_pos!.x,
                      //y: sensor.zn_rel_pos!.y,
                      x: 1,
                      y: 1,
                    }}
                    global={false}
                  />
                );
              })}

              {/* {Array.from({ length: dimensions.x }).map((_, col) =>
                Array.from({ length: dimensions.y }).map((_, row) => (
                  <SensorListRender
                    key={`${col}-${row}`} // Unique key for each SensorListRender
                    sensors={fetchedGreenhouseData.zones[1].sensors}
                    localZoneId={0}
                    plot_height={0} // Assuming this is intentional
                    squareId={{ x: col, y: row }}
                    global={true}
                  />
                )),
              )} */}
            </>
          )}
          {/* {zones!.slice(1).map((zone) => {
            return (
              <ZoneRender
                zone={zone}
                key={`zone${zone.zone_number}`}
                localZoneId={zone.zone_number}
              />
            );
          })} */}
        </group>
      </PresentationControls>
    </>
  );
}
