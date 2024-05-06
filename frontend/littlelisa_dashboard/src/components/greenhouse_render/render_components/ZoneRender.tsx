import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";

import { ZoneRenderProps } from "../../../../types/common.ts";
import SensorListRender from "./SensorListRender.tsx";
import SprinklerListRender from "./SprinklerListRender.tsx";

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
      <mesh>
        <boxGeometry args={[zone_x, zone_y, zone_z, zone_x, zone_y, zone_z]} />
        <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
      </mesh>
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
