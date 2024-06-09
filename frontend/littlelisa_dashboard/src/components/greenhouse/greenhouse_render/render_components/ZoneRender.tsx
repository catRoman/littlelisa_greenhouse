import { ThreeEvent } from "@react-three/fiber";
import { Object3D, Object3DEventMap, Vector3, type Group } from "three";
// import SprinklerListRender from "./SprinklerListRender.tsx";
import {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GreenHouseContext } from "../../../../context/GreenHouseContextProvider.tsx";
import { ZoneDataFull } from "../../../../../types/common.ts";
import PlotRender from "./PlotRender.tsx";
import { GreenHouseViewState } from "../../../../../types/enums.ts";
import { TransformControls } from "@react-three/drei";

type ZoneRenderProps = {
  zone: ZoneDataFull;
  localZoneId: number;
};

export default function ZoneRender({ zone, localZoneId }: ZoneRenderProps) {
  const zoneRef = useRef<Group>(null);
  const object3DRef = zoneRef as MutableRefObject<Object3D>;

  const {
    previousCameraProperties,
    currentCameraProperties,
    setSelectedZoneNumber,
    inZone,
    setViewState,
    fetchedGreenhouseData,
  } = useContext(GreenHouseContext);

  const { dimensions, zone_start_point, sensors, nodes } = zone;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    previousCameraProperties.current = currentCameraProperties;
    // console.log(previousCameraProperties.current);
    setSelectedZoneNumber(localZoneId);
    inZone.current = true;
    setViewState(GreenHouseViewState.Zone);
  }

  if (fetchedGreenhouseData) {
    return (
      <>
        {/* {object3DRef.current && (
          <TransformControls
            object={zoneRef}
            mode="translate"
            translationSnap={1}
          />
        )} */}
        <group
          ref={zoneRef}
          onClick={zoneEventHandler}
          position={
            new Vector3(
              zone_start_point.x + dimensions.x / 2 - 1,
              zone_start_point.y + dimensions.y / 2 - 1,
              dimensions.z / 2,
            )
          }
        >
          {(function (): JSX.Element {
            const zone = [];
            for (let i = 0; i < dimensions.x; i++) {
              for (let j = 0; j < dimensions.y; j++) {
                zone.push(
                  <PlotRender
                    key={`square_${i + 1}_${j + 1}`}
                    position={[
                      i - dimensions.x / 2 + 0.5,
                      j - dimensions.y / 2 + 0.5,
                      0,
                    ]}
                    squareId={{ x: i, y: j }}
                    args={[1, 1, dimensions.z]}
                    localZoneId={localZoneId}
                    sensors={sensors}
                    nodes={nodes}
                  />,
                );
              }
            }
            return <>{zone}</>;
          })()}
          {/* <SprinklerListRender
        sprinklers={sprinklers}
        zoneId={localZoneId}
        zone_dim={zone.dimensions}
      /> */}
        </group>
      </>
    );
  } else {
    console.log("loading fetchedGreenhouseData for zone");
  }
}
