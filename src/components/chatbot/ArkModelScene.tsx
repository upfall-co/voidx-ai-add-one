"use client";

import { useGLTF } from "@react-three/drei";

export function ArkModelScene({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <primitive
      object={scene}
      position={[0, -0.4, 0]}
      rotation={[0, Math.PI / 25, 0]}
    />
  );
}
