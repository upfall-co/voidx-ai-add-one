import { useAgentStore } from "@/stores/agentStore";
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
      <Suspense fallback={null}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={3} />
        <directionalLight position={[-10, 10, -5]} intensity={0.2} />
        <CursorAgentModel url={glb} asleep={asleep} />
      </Suspense>
    </Canvas>
  );
}
