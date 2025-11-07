import { useAgentStore } from "@/stores/agentStore";
import { Environment, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import CursorAgentModel from "./CursorAgentModel";

export default function CursorAgent() {
  const [agent, setAgent] = useState("");

  const asleep = useAgentStore((s) => s.asleep);
  const glb = useAgentStore((s) => s.glb);

  useEffect(() => {
    const duration = Math.min(1600, 5000);
    const timer = window.setTimeout(() => {
      setAgent(glb);
    }, duration);
    if (agent !== glb) {
      useGLTF.preload(glb);
    }
    return () => clearTimeout(timer);
  }, [glb]);

  if (!agent) return null;

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
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        top: 0,
      }}
    >
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        {/* 2. asleep 상태를 모델 컴포넌트로 전달 */}
        <CursorAgentModel url={agent} asleep={asleep} />
        <Environment preset="warehouse" />
      </Suspense>
    </Canvas>
  );
}