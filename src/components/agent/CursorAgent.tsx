import { useAgentStore } from "@/stores/agentStore";
import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import CursorAgentModel from "./CursorAgentModel";

export default function CursorAgent() {
  const asleep = useAgentStore((s) => s.asleep);
  const glb = useAgentStore((s) => s.glb);

  if (!glb || asleep) return null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      orthographic
      camera={{
        zoom: 50,
        position: [0, 0, 10],
      }}
      style={{
        position: "fixed",
        zIndex: 100000,
        pointerEvents: "none",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        <CursorAgentModel url={glb} asleep={asleep} />
        <Environment preset="warehouse" />
      </Suspense>
    </Canvas>
  );
}
