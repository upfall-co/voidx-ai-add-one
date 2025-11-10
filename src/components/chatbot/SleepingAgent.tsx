// SleepingAgentModel.tsx
import { useStableWander } from "@/hooks/useStableWander";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GhostScene } from "../agent/CursorAgentModel";

const SleepingAgentModel = ({ url }: { url: string }) => {
  const moverRef = useRef<THREE.Group>(null!);

  useStableWander(moverRef, { seed: 1337 });

  useEffect(() => {
    const g = moverRef.current;
    g.traverse((o) => (o.matrixAutoUpdate = true));
  }, []);

  return (
    <group position={[0, -0.2, 0.4]} rotation={[-0.4, 0.8, 0.3]} scale={0.2}>
      <group ref={moverRef}>
        <GhostScene url={url} />
      </group>
    </group>
  );
};

export default SleepingAgentModel;
