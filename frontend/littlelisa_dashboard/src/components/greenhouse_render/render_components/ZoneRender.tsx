import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";

import { ZoneRenderProps } from "../../../../types/common.ts";
import SensorListRender from "./SensorListRender.tsx";
import SprinklerListRender from "./SprinklerListRender.tsx";
import React from "react";
import SquareRender from "./SquareRender.tsx";

export default function ZoneRender({ zone, zoneId }: ZoneRenderProps) {
  const {
    loc_coord,
    dimensions: { x: zone_x, y: zone_y, z: zone_z },
    sensors,
    sprinklers,
  } = zone;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    console.log(`zone ${zoneId} clicked`);
  }

  return (
    <group
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
                zoneId={zoneId}
              />,
            );
          }
        }
        return <>{zone}</>;
      })()}
      <SensorListRender
        sensors={sensors}
        zoneId={zoneId}
        zone_dim={zone.dimensions}
      />
      <SprinklerListRender
        sprinklers={sprinklers}
        zoneId={zoneId}
        zone_dim={zone.dimensions}
      />
    </group>
  );
}
