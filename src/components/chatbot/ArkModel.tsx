"use client";

import { useAgentStore } from "@/stores/agentStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import clsx from "clsx";
import { Suspense } from "react";
import SleepingAgentModel from "./SleepingAgent";

export default function ArkModel() {
  const arkGlb = useChatbotStore((s) => s.arkGlb);
  const mode = useChatbotStore((s) => s.mode);
  const glb = useAgentStore((s) => s.glb);
  const asleep = useAgentStore((s) => s.asleep);

  useGLTF.preload(arkGlb);

  if (typeof window === "undefined" || mode === "360") return null;

  return (
    <div
      className={clsx("w-full h-full", mode === "chatting" ? "opacity-30" : "")}
    >
      <Suspense fallback={null}>
        <Canvas dpr={[1, 2]} camera={{ fov: 6.5, position: [15, 6, 15] }}>
          <ContactShadows
            position={[0, -0.2, 0]}
            opacity={0.7}
            scale={2.5}
            blur={8}
            far={2}
          />
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} />
          <directionalLight position={[-10, 10, -5]} intensity={0.2} />
          {asleep && <SleepingAgentModel url={glb} />}
          <Model url={arkGlb} />
        </Canvas>
      </Suspense>
    </div>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <primitive
      object={scene}
      position={[0, -0.4, 0]}
      rotation={[0, Math.PI / 25, 0]}
    />
  );
}
