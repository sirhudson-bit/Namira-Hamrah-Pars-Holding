"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

function NodeField() {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.3, 1), []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#26B5A6" transparent opacity={0.45} />
      </lineSegments>
      <points geometry={geometry}>
        <pointsMaterial
          color="#6FD8CB"
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>
    </group>
  );
}

export default function LabsScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.9} />
      <Suspense fallback={null}>
        <NodeField />
        <Sparkles
          count={40}
          scale={[9, 7, 6]}
          size={1.8}
          speed={0.25}
          color="#26B5A6"
          opacity={0.5}
        />
      </Suspense>
    </Canvas>
  );
}
