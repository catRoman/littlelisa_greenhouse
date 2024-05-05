import { useFrame } from "@react-three/fiber";
import { useRef, Suspense } from "react";
import { type Mesh, type Group } from "three";
import { Bounds, useBounds } from "@react-three/drei";

import {
  PivotControls,
  OrbitControls,
  TransformControls,
} from "@react-three/drei";

export default function GreenHouseRender() {
  const sceneRef = useRef<Group>(null!);
  const zone1Ref = useRef<Mesh>(null!);
  const zone2Ref = useRef<Mesh>(null!);
  const zone3Ref = useRef<Mesh>(null!);
  const zone4Ref = useRef<Mesh>(null!);

  useFrame((state, delta) => {
    //TODO:
    //spin slowly
    //stop if mouse clicked
    //wait a period of no clicking start spinning again
    // sceneRef.current.rotation.z += 0.1 * delta;
  });

  function zone1EventHandler(event) {
    event.stopPropagation();
    console.log("zone1 clicked");
  }
  function zone2EventHandler(event) {
    event.stopPropagation();
    console.log("zone2 clicked");
  }
  function zone3EventHandler(event) {
    event.stopPropagation();
    console.log("zone3 clicked");
  }
  function zone4EventHandler(event) {
    event.stopPropagation();
    console.log("zone4 clicked");
  }

  return (
    <>
      <OrbitControls
        maxPolarAngle={Math.PI / 2}
        zoomToCursor={true}
        makeDefault
      />

      {/*Ground*/}
      <group ref={sceneRef} rotation={[-(Math.PI / 2), 0, 0]}>
        <mesh>
          <planeGeometry args={[12, 16, 12, 16]} />
          <meshBasicMaterial args={[{ color: "green", wireframe: true }]} />
        </mesh>

        {/*Zone 1*/}
        {/* <TransformControls object={zone1Ref} translationSnap={1} /> */}
        <mesh ref={zone1Ref} position={[-4, -5, 1]}>
          <boxGeometry args={[4, 6, 2, 4, 6, 2]} />
          <meshBasicMaterial args={[{ color: "blue", wireframe: true }]} />
        </mesh>

        {/*Zone 2*/}
        {/* <PivotControls anchor={[0, 0, 0]} depthTest={false}> */}
        <mesh position={[-4, 1, 1.5]} onClick={zone2EventHandler}>
          <boxGeometry args={[4, 6, 3, 4, 6, 3]} />
          <meshBasicMaterial args={[{ color: "red", wireframe: true }]} />
        </mesh>
        {/* </PivotControls> */}

        {/*Zone 3*/}
        <mesh position={[4, -2, 1]}>
          <boxGeometry args={[4, 8, 2, 4, 8, 2]} />
          <meshBasicMaterial args={[{ color: "yellow", wireframe: true }]} />
        </mesh>

        {/*Zone 4*/}

        <mesh position={[0, 7.5, 1]} onClick={zone4EventHandler}>
          <boxGeometry args={[4, 1, 2, 4, 1, 2]} />
          <meshBasicMaterial args={[{ color: "purple", wireframe: true }]} />
        </mesh>
      </group>
    </>
  );
}
