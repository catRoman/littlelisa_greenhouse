import { ThreeEvent } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import SprinklerListRender from "./SprinklerListRender.tsx";
import { useContext, useEffect, useRef, useState } from "react";
import { GreenHouseContext } from "../../../../context/GreenHouseContextProvider.tsx";
import { ZoneData, ZoneDataFull } from "../../../../../types/common.ts";
import PlotRender from "./PlotRender.tsx";
import { GreenHouseViewState } from "../../../../../types/enums.ts";

type ZoneRenderProps = {
  zone: ZoneData;
  localZoneId: number;
};

export default function ZoneRender({ zone, localZoneId }: ZoneRenderProps) {
  const zoneRef = useRef<Group>(null);
  const [zoneData, setZoneData] = useState<ZoneDataFull>({});
  const {
    previousCameraProperties,
    currentCameraProperties,
    setSelectedZoneId,
    inZone,
    setViewState,
  } = useContext(GreenHouseContext);

  const {
    zone_id,
    zone_start_point,
    dimensions: { x: zone_x, y: zone_y, z: zone_z },
  } = zone;

  useEffect(() => {
    const fetchZoneData = async () => {
      const url = `/api/users/1/greenhouses/1/zones/${zone_id}`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setZoneData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchZoneData();
  }, [zone_id]);

  const { sensors, nodes } = zoneData!;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    previousCameraProperties.current = currentCameraProperties;
    // console.log(previousCameraProperties.current);
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
          zone_start_point.x + zone_x / 2 - 1,
          zone_start_point.y + zone_y / 2 - 1,
          zone_z / 2,
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
  );
}
