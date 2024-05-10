import { ThreeEvent } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import SprinklerListRender from "./SprinklerListRender.tsx";
import { useContext, useRef } from "react";
import { GreenHouseContext } from "../../../../context/GreenHouseContextProvider.tsx";
import { ZoneData } from "../../../../../types/common.ts";
import PlotRender from "./PlotRender.tsx";
import { GreenHouseViewState } from "../../../../../types/enums.ts";

type ZoneRenderProps = {
  zone: ZoneData;
  localZoneId: number;
};

export default function ZoneRender({ zone, localZoneId }: ZoneRenderProps) {
  const zoneRef = useRef<Group>(null);

  const {
    previousCameraProperties,
    currentCameraProperties,
    setSelectedZoneId,
    inZone,
    setViewState,
  } = useContext(GreenHouseContext);

  const {
    loc_coord,
    dimensions: { x: zone_x, y: zone_y, z: zone_z },
    sensors,
    sprinklers,
  } = zone;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    previousCameraProperties.current = currentCameraProperties;
    console.log(previousCameraProperties.current);
    setSelectedZoneId(localZoneId);
    inZone.current = true;
    setViewState(GreenHouseViewState.Zone);
  }

  return (
    <group
      ref={zoneRef}
      onClick={zoneEventHandler}
      position={
        new Vector3(
          loc_coord.x + zone_x / 2,
          loc_coord.y + zone_y / 2,
          loc_coord.z + zone_z / 2,
        )
      }
    >
      {(function (): JSX.Element {
        const zone = [];
        for (let i = 0; i < zone_x; i++) {
          for (let j = 0; j < zone_y; j++) {
            zone.push(
              <PlotRender
                key={`square_${i}_${j}`}
                position={[i - zone_x / 2 + 0.5, j - zone_y / 2 + 0.5, 0]}
                squareId={{ x: i, y: j }}
                args={[1, 1, zone_z]}
                localZoneId={localZoneId}
                sensors={sensors}
              />,
            );
          }
        }
        return <>{zone}</>;
      })()}
      <SprinklerListRender
        sprinklers={sprinklers}
        zoneId={localZoneId}
        zone_dim={zone.dimensions}
      />
    </group>
  );
}
