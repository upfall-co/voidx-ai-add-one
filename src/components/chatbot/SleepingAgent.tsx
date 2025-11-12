// SleepingAgentModel.tsx
import { useStableWander } from "@/hooks/useStableWander";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GhostScene } from "../agent/CursorAgentModel";

const SleepingAgentModel = ({ url }: { url: string }) => {
  const moverRef = useRef<THREE.Group>(null!);

  useStableWander(moverRef);

  useEffect(() => {
    const g = moverRef.current;
    g.traverse((o) => (o.matrixAutoUpdate = true));
  }, []);

  return (
    <group ref={moverRef}>
      <group rotation={[0, Math.PI, 0]} scale={0.2}>
        <GhostScene url={url} />
      </group>
    </group>
  );
};

export default SleepingAgentModel;
