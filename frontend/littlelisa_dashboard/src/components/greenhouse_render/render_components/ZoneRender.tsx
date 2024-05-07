import { ThreeEvent } from "@react-three/fiber";
import { Vector3, type Group } from "three";

import SensorListRender from "./SensorListRender.tsx";
import SprinklerListRender from "./SprinklerListRender.tsx";
import SquareRender from "./SquareRender.tsx";
import { useContext, useEffect, useRef, useState } from "react";
import { ZoneContext } from "../../../context/ZoneContextProvider.tsx";
import { ZoneData } from "../../../../types/common.ts";

type ZoneRenderProps = {
  zone: ZoneData;
  localZoneId: number;
};

export default function ZoneRender({ zone, localZoneId }: ZoneRenderProps) {
  const zoneRef = useRef<Group>(null); // Or the appropriate Three.js type
  const { setZonePosition, setZoneId, zoneId } = useContext(ZoneContext);
  const {
    loc_coord,
    dimensions: { x: zone_x, y: zone_y, z: zone_z },
    sensors,
    sprinklers,
  } = zone;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (zoneRef.current) {
      setZonePosition(zoneRef.current.position.clone());
      setZoneId(localZoneId);
      console.log("zonerender clicked");
    }
    // console.log(`zone ${zoneId} clicked`);
  }
  useEffect(() => {
    console.log("zoneRender->zoneId: ", zoneId);
  }, [zoneId]);
  useEffect(() => {
    console.log("zoneRender zoneid:", zoneId);
  }, [zoneId]);

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
              <SquareRender
                key={`square_${i}_${j}`}
                position={[i - zone_x / 2 + 0.5, j - zone_y / 2 + 0.5, 0]}
                args={[1, 1, zone_z]}
                squareId={{ x: i, y: j }}
                zoneId={localZoneId}
              />,
            );
          }
        }
        return <>{zone}</>;
      })()}
      <SensorListRender
        sensors={sensors}
        zoneId={localZoneId}
        zone_dim={zone.dimensions}
      />
      <SprinklerListRender
        sprinklers={sprinklers}
        zoneId={localZoneId}
        zone_dim={zone.dimensions}
      />
    </group>
  );
}
