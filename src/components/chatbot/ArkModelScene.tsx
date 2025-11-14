"use client";

import { cdnUrl } from "@/constant/common";
import { useAgentStore } from "@/stores/agentStore";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";
import SleepingAgentModel from "./SleepingAgent";

const arkUrl = `${cdnUrl}/3d/ark_model_00.glb`;
useGLTF.preload(arkUrl); // 프리로드

export function ArkModelScene() {
  const { scene } = useGLTF(arkUrl);
  const asleep = useAgentStore((s) => s.asleep);
  const glb = useAgentStore((s) => s.glb);

  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { gl, size, camera, invalidate } = useThree();

  useEffect(() => {
    camera.updateProjectionMatrix();
    invalidate();
  }, [gl, size, camera, invalidate]);

  useEffect(() => {
    cloned.visible = true;
    cloned.traverse((o: any) => {
      if (o.material) {
        if (o.material.opacity === 0) o.material.opacity = 1;
        if (o.material.transparent && o.material.opacity < 0.01) {
          o.material.opacity = 1;
          o.material.needsUpdate = true;
        }
      }
      if (o.visible === false) o.visible = true;
      if (o.frustumCulled) o.frustumCulled = false;
    });
  }, [cloned]);

  useEffect(() => {
    const worldPos = new THREE.Vector3();

    // 월드 행렬 먼저 업데이트
    cloned.updateWorldMatrix(true, true);

    cloned.traverse((o: any) => {
      if (o.isMesh) {
        o.getWorldPosition(worldPos);

        console.log("[MESH WORLD]", "name:", o.name || "(no-name)", "pos:", {
          x: worldPos.x,
          y: worldPos.y,
          z: worldPos.z,
        });
      }
    });
  }, [cloned]);

  return (
    <>
      {asleep && glb && <SleepingAgentModel url={glb} />}

      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 5]} intensity={2.0} />
      <directionalLight position={[-10, 10, -5]} intensity={0.2} />
      <primitive
        key={`ark-${asleep ? "sleep" : "awake"}`}
        object={cloned}
        position={[0, -0.4, 0]}
        rotation={[0, Math.PI / 25, 0]}
        dispose={null}
        frustumCulled={false}
      />
    </>
  );
}
