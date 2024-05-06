import { Vector3 } from "three";

type GreenhouseRenderProps = {
  dimensions: { x: number; y: number };
};

export default function GreenHouseRender({
  dimensions: { x, y },
}: GreenhouseRenderProps) {
  return (
    <mesh position={new Vector3(x / 2 - 0.5, y / 2 - 0.5, -0.5)}>
      <planeGeometry args={[x, y, x, y]} />
      <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
    </mesh>
  );
}
