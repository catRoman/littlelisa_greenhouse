import { ThreeEvent } from "@react-three/fiber";
import { useContext, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { GreenHouseContext } from "../../../../context/GreenHouseContextProvider";
import { Module, Sensor, SquareId } from "../../../../../types/common";
import SensorListRender from "./SensorListRender";
import { GreenHouseViewState } from "../../../../../types/enums";

import ModuleListRender from "../ModuleListRender";

type PlotRenderProps = {
  args: [x: number, y: number, z: number];
  squareId: SquareId;
  localZoneId: number;
  sensors: Sensor[] | null;
  nodes: Module[] | null;
  position: [x: number, y: number, z: number];
};

export default function PlotRender({
  args,
  squareId,
  localZoneId,
  sensors,
  nodes,
  position,
}: PlotRenderProps) {
  const [hovering, setHovering] = useState<boolean>(false);

  const {
    inZone,
    selectedZoneNumber,
    setSelectedSquareId,
    selectedSquareId,
    previousCameraProperties,
    setViewState,
    setCurrentCameraProperties,
    currentCameraProperties,
    setSelectedPlant,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);

  const plotInfo = fetchedGreenhouseData?.squares.find((plot) => {
    if (
      plot.row ===
        squareId.y +
          fetchedGreenhouseData.zones[localZoneId].zone_start_point.y &&
      plot.col ===
        squareId.x +
          fetchedGreenhouseData.zones[localZoneId].zone_start_point.x &&
      plot.zone_number === localZoneId
    ) {
      return plot;
    }
  });

  const color = plotInfo?.is_empty ? "brown" : "green";

  const spring = useSpring({
    color:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneNumber) ||
      (localZoneId === selectedZoneNumber && hovering) ||
      (selectedZoneNumber === 0 && hovering)
        ? "orange"
        : color,
    wireframe:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneNumber) ||
      (localZoneId === selectedZoneNumber && hovering) ||
      (selectedZoneNumber === 0 && hovering)
        ? false
        : true,
    position:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneNumber) ||
      (localZoneId === selectedZoneNumber && hovering) ||
      (selectedZoneNumber === 0 && hovering)
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
    if (localZoneId === selectedZoneNumber) {
      setSelectedSquareId(squareId);
      setViewState(GreenHouseViewState.Plot);
      previousCameraProperties.current = currentCameraProperties;
      // console.log(previousCameraProperties.current);
      const worldPosition = new THREE.Vector3();
      worldPosition.setFromMatrixPosition(event.object.matrixWorld);
      //equivalent to lookat thanks chat - linear-algebra not today lol
      const newPosition = new THREE.Vector3(
        worldPosition.x,
        worldPosition.y + 4,
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

      if (
        plotInfo !== undefined &&
        selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneNumber &&
        !plotInfo?.is_empty &&
        plotInfo?.plant_type !== undefined &&
        plotInfo.plant_type !== null
      ) {
        setSelectedPlant(plotInfo.plant_type);
      } else {
        setSelectedPlant("");
      }
    }
  }
  // function squareMissedHandler(event: MouseEvent) {
  //   event.stopPropagation();
  //   if (
  //     selectedSquareId?.x === squareId.x &&
  //     selectedSquareId?.y === squareId.y
  //   ) {
  //     console.log("squareMissed");
  //     setSelectedSquareId(null);
  //     //setViewState(GreenHouseViewState.Zone);

  //     setCurrentCameraProperties();
  //   }
  // }
  if (fetchedGreenhouseData !== undefined) {
    return (
      <animated.group
        // onPointerMissed={squareMissedHandler}
        position={spring.position.to((x: number, y: number, z: number) => [
          x,
          y,
          z,
        ])}
      >
        <animated.mesh
          onClick={squareClickedHandler}
          onPointerEnter={pointerEnterEventHandler}
          onPointerLeave={pointerLeaveEventHandler}
        >
          <boxGeometry args={args} />
          <animated.meshBasicMaterial
            color={spring.color}
            wireframe={spring.wireframe}
          />
        </animated.mesh>
        <SensorListRender
          sensors={sensors}
          plot_height={args[2]}
          localZoneId={localZoneId}
          squareId={squareId}
          global={false}
        />

        <ModuleListRender
          nodes={nodes}
          plot_height={args[2]}
          squareId={squareId}
          global={false}
          controller={false}
          localZoneId={localZoneId}
        />
      </animated.group>
    );
  } else {
    return <h1>loading</h1>;
  }
}
