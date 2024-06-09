import { ThreeEvent } from "@react-three/fiber";
import { SquarePos } from "../../../../../types/common";

type SprinklerListRender = {
  zoneId: number;
  sprinklers: SquarePos[] | null;
  zone_dim: { x: number; y: number; z: number };
};

export default function SprinklerListRender({
  zoneId,
  zone_dim,
  sprinklers,
}: SprinklerListRender) {
  function sprinklerEventHandler(
    event: ThreeEvent<MouseEvent>,
    sprinklerId: number,
  ) {
    event.stopPropagation();
    console.log(`zone ${zoneId} sprinkler ${sprinklerId} clicked`);
  }

  if (sprinklers) {
    return (
      <>
        {sprinklers.map((sprinklers, index) => {
          const { x: sprinkler_x, y: sprinkler_y } = sprinklers;
          const coneHeight = 0.5;
          const sprinklerId = index + 1;
          return (
            <mesh
              key={index + 1}
              onClick={(event) => sprinklerEventHandler(event, sprinklerId)}
              position={[
                sprinkler_x - zone_dim.x / 2,
                sprinkler_y - zone_dim.y / 2,
                zone_dim.z / 2 + coneHeight / 2,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[0.1, coneHeight, 8, 4]} />
              <meshBasicMaterial args={[{ color: "blue", wireframe: true }]} />
            </mesh>
          );
        })}
      </>
    );
  }

  return <></>;
}
