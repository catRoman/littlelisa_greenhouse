import { ThreeEvent, useThree } from "@react-three/fiber";
import { Vector3, type Group } from "three";

import SensorListRender from "./SensorListRender.tsx";
import SprinklerListRender from "./SprinklerListRender.tsx";
import SquareRender from "./SquareRender.tsx";
import { useContext, useRef } from "react";
import { ZoneContext } from "../../../context/ZoneContextProvider.tsx";
import { ZoneData } from "../../../../types/common.ts";
import SquareContextProvider from "../../../context/SquareContextProvider.tsx";

type ZoneRenderProps = {
  zone: ZoneData;
  localZoneId: number;
  squareSelectedRef: React.MutableRefObject<boolean>;
};

export default function ZoneRender({
  zone,
  localZoneId,
  squareSelectedRef,
}: ZoneRenderProps) {
  const zoneRef = useRef<Group>(null);

  const { setZonePosition, setZoneId, inZone, setInZone } =
    useContext(ZoneContext);

  const {
    loc_coord,
    dimensions: { x: zone_x, y: zone_y, z: zone_z },
    sensors,
    sprinklers,
  } = zone;

  function zoneEventHandler(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (zoneRef.current && !inZone) {
      setInZone(true);
      setZonePosition(zoneRef.current.position.clone());
      setZoneId(localZoneId);
    }
  }

  return (
    <SquareContextProvider>
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
                  localZoneId={localZoneId}
                  squareSelectedRef={squareSelectedRef}
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
    </SquareContextProvider>
  );
}
