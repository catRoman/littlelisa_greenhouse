import { useRef } from "react";
import { type Group } from "three";

import { OrbitControls } from "@react-three/drei";
import ZoneRender from "./render_components/ZoneRender";
import GreenHouseRender from "./render_components/GreenHouseRender";
import { GreenhouseData } from "../../../types/common";

type GreenHouseModelProps = {
  model_info: GreenhouseData;
};

export default function GreenHouseModel({ model_info }: GreenHouseModelProps) {
  const sceneRef = useRef<Group>(null!);

  const {
    greenhouse: { dimensions },
  } = model_info;

  return (
    <>
      {/* <OrbitControls
        maxPolarAngle={Math.PI / 2}
        zoomToCursor={true}
        makeDefault
      /> */}

      {/*Ground*/}

      <group
        position={[-dimensions.x / 2, -1, dimensions.y / 2 - 1]}
        ref={sceneRef}
        rotation={[-(Math.PI / 2), 0, 0]}
      >
        <GreenHouseRender dimensions={dimensions} />

        {model_info.zones.map((zone, index) => {
          const zoneId = index + 1;
          return (
            <ZoneRender zone={zone} key={`zone${index + 1}`} zoneId={zoneId} />
          );
        })}
      </group>
    </>
  );
}
