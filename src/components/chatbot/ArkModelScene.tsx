"use client";

import { cdnUrl } from "@/constant/common";
import { useGLTF } from "@react-three/drei";

const arkUrl = `${cdnUrl}/3d/ark_model_00.glb`;

export function ArkModelScene() {
  const { scene } = useGLTF(arkUrl);

  return (
    <primitive
      object={scene}
      position={[0, -0.4, 0]}
      rotation={[0, Math.PI / 25, 0]}
    />
  );
}
