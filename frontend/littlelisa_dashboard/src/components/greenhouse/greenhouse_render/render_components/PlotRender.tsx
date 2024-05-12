import { ThreeEvent } from "@react-three/fiber";
import { useContext, useState } from "react";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { GreenHouseContext } from "../../../../context/GreenHouseContextProvider";
import { Module, Plot, Sensor, SquareId } from "../../../../../types/common";
import SensorListRender from "./SensorListRender";
import { GreenHouseViewState } from "../../../../../types/enums";
import { square_data } from "../../../../data/mock_json/square_data";
import NodeListRender from "../NodeListRender";

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
    selectedZoneId,
    setSelectedSquareId,
    selectedSquareId,
    previousCameraProperties,
    setViewState,
    setCurrentCameraProperties,
    currentCameraProperties,
    setSelectedPlant,
  } = useContext(GreenHouseContext);

  const plotInfo: Plot | undefined = square_data.find((plot) => {
    if (
      plot.row - 1 === squareId.y &&
      plot.column - 1 === squareId.x &&
      plot.zone_id === localZoneId
    ) {
      return plot;
    }
  });

  const color = plotInfo?.is_empty ? "brown" : "green";

  const spring = useSpring({
    color:
      (selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneId) ||
      (localZoneId === selectedZoneId && hovering) ||
      (selectedZoneId === 0 && hovering)
        ? "orange"
        : color,
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
      setViewState(GreenHouseViewState.Plot);
      previousCameraProperties.current = currentCameraProperties;
      console.log(previousCameraProperties.current);
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
        selectedSquareId?.x === squareId.x &&
        selectedSquareId?.y === squareId.y &&
        localZoneId === selectedZoneId &&
        plotInfo?.plant_type !== undefined
      ) {
        console.log("inclick: ", plotInfo.plant_type);
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
      />

      <NodeListRender nodes={nodes} plot_height={args[2]} squareId={squareId} />
    </animated.group>
  );
}
