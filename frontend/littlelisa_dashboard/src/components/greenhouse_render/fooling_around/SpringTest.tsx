import React, { useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSpring, animated, config } from "@react-spring/three";

function MyRotatingBox() {
  const [hovered, hover] = useState(false);

  const springs = useSpring({ color: hovered ? "hotpink" : "orange" });

  return (
    <mesh
      onPointerEnter={(e) => {
        e.stopPropagation();
        hover(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        hover(false);
      }}
    >
      <boxGeometry />
      <animated.meshBasicMaterial color={springs.color} />
    </mesh>
  );
}

export default function SpringTest() {
  return (
    <>
      <MyRotatingBox />
      <ambientLight intensity={0.1} />
      <directionalLight />
    </>
  );
}
