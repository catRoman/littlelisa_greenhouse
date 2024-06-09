import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {
  PresentationControls,
  PerspectiveCamera,
  TransformControls,
} from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { GreenHouseContext } from "../../../context/GreenHouseContextProvider";
import { zoneCameraViews } from "./render_components/data/zoneCameras";
import { useSpring, animated } from "@react-spring/three";
import SensorListRender from "./render_components/SensorListRender";
import ModuleListRender from "./ModuleListRender";

export default function GreenHouseModel() {
  const sceneRef = useRef<THREE.Group>(null!);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const greenhouseData = useContext(GreenHouseContext);
  const { fetchedGreenhouseData } = greenhouseData;

  const {
    selectedZoneNumber,
    enableControls,
    previousCameraProperties,
    setCurrentCameraProperties,
    currentCameraProperties,
  } = useContext(GreenHouseContext);

  const scene = useThree((state) => state.scene);

  useEffect(() => {
    if (selectedZoneNumber) {
      const newPosition = new THREE.Vector3(
        zoneCameraViews[selectedZoneNumber - 1].posX,
        zoneCameraViews[selectedZoneNumber - 1].posY,
        zoneCameraViews[selectedZoneNumber - 1].posZ,
      );
      const newRotation = new THREE.Euler(
        zoneCameraViews[selectedZoneNumber - 1].rotX,
        zoneCameraViews[selectedZoneNumber - 1].rotY,
        zoneCameraViews[selectedZoneNumber - 1].rotZ,
      );

      setCurrentCameraProperties({
        fov: 35,
        zoom: 1,
        near: 0.1,
        far: 5000,
        rotation: newRotation,
        position: newPosition,
      });
      // console.log(`zone clicked: ${selectedZoneNumber}`);
      enableControls.current = false;
    }
  }, [selectedZoneNumber, enableControls, setCurrentCameraProperties]);

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
              {/* greenhouse global sensors */}
              {fetchedGreenhouseData.zones[0]?.sensors &&
                fetchedGreenhouseData.zones[0].sensors?.map((sensor) => {
                  if (sensor.square_id) {
                    return (
                      <SensorListRender
                        key={`${sensor.square_pos?.x}-${sensor.square_pos?.y}`}
                        sensors={fetchedGreenhouseData.zones[0].sensors}
                        localZoneId={0}
                        plot_height={0}
                        squareId={{
                          x: sensor.square_pos!.x - 0.5,
                          y: sensor.square_pos!.y - 0.5,
                        }}
                        global={true}
                      />
                    );
                  } else if (
                    sensor.zn_rel_pos?.x !== -1 &&
                    sensor.zn_rel_pos?.y !== -1 &&
                    sensor.zn_rel_pos?.z !== -1
                  ) {
                    return (
                      <SensorListRender
                        key={`${sensor.zn_rel_pos?.x}-${sensor.zn_rel_pos?.y}-${sensor.zn_rel_pos?.z}`}
                        sensors={fetchedGreenhouseData.zones[0].sensors}
                        localZoneId={0}
                        plot_height={sensor.zn_rel_pos!.z}
                        squareId={{
                          x: sensor.zn_rel_pos!.x - 0.5,
                          y: sensor.zn_rel_pos!.y - 0.5,
                        }}
                        global={true}
                      />
                    );
                  }
                })}
              {/* greenhouse global controllers */}
              {fetchedGreenhouseData.controllers?.map((controller) => {
                if (controller.square_id) {
                  return (
                    <ModuleListRender
                      key={`${controller.square_pos?.x}-${controller.square_pos?.y}}`}
                      nodes={fetchedGreenhouseData.controllers}
                      plot_height={
                        fetchedGreenhouseData.zones[
                          fetchedGreenhouseData.squares[controller.square_id]
                            .zone_number
                        ].dimensions.z
                      }
                      squareId={{
                        x: controller.square_pos!.x - 0.5,
                        y: controller.square_pos!.y - 0.5,
                      }}
                      global={true}
                      controller={true}
                      localZoneId={0}
                    />
                  );
                } else {
                  return (
                    <ModuleListRender
                      key={`${controller.zn_rel_pos?.x}-${controller.zn_rel_pos?.y}-${controller.zn_rel_pos?.z}`}
                      nodes={fetchedGreenhouseData.controllers}
                      plot_height={controller.zn_rel_pos!.z}
                      squareId={{
                        x: controller.zn_rel_pos!.x - 0.5,
                        y: controller.zn_rel_pos!.y - 0.5,
                      }}
                      global={true}
                      controller={true}
                      localZoneId={0}
                    />
                  );
                }
              })}
            </>
          )}
          {zones!.slice(1).map((zone) => {
            return (
              <ZoneRender
                key={`zone${zone.zone_number}`}
                zone={zone}
                localZoneId={zone.zone_number}
              />
            );
          })}
        </group>
      </PresentationControls>
    </>
  );
}
