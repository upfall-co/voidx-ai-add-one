import {
  useCursorFollow,
  useCursorFollowForMobile,
} from "@/hooks/useCursorFollow";
import { useVoidxAgentStore } from "@/stores/voidxAgentStore";
import { Environment, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Group } from "three";
import { LevelUpEffect } from "./LevelUpEffect";

export default function CursorAgent() {
  const [agent, setAgent] = useState("");
  const agentUrl = useVoidxAgentStore((s) => s.agentUrl);

  useEffect(() => {
    const duration = Math.min(1600, 5000);
    const timer = window.setTimeout(() => {
      setAgent(agentUrl);
    }, duration);
    if (agent !== agentUrl) {
      useGLTF.preload(agentUrl);
    }
    return () => clearTimeout(timer);
  }, [agentUrl]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      orthographic
      camera={{
        zoom: 50,
        position: [0, 0, 10],
      }}
      style={{
        position: "absolute",
        zIndex: 100000,
        pointerEvents: "none",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      }}
    >
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        {agent && <GlbModel url={agent} />}
        <Environment preset="warehouse" />
      </Suspense>
    </Canvas>
  );
}
export function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const agentRef = useRef<Group>(null!);
  const level = useVoidxAgentStore((s) => s.level);
  const [isChange, setIsChange] = useState(false);
  const prevLevelRef = useRef(Math.floor(level));
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  useCursorFollow(agentRef, !isMobile, { moveSpeed: 5 });
  useCursorFollowForMobile(agentRef, isMobile, { moveSpeed: 5 });

  useEffect(() => {
    const agent = agentRef.current;
    if (!agent) return;
    agent.position.set(0, 0.5, 0);
    agent.rotation.set(0, 0, 0);
  }, [scene]);

  useEffect(() => {
    const currentLevelInt = Math.floor(level);
    if (prevLevelRef.current < currentLevelInt) {
      setIsChange(true);
      const timer = setTimeout(() => {
        setIsChange(false);
        prevLevelRef.current = currentLevelInt;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return (
    <group ref={agentRef}>
      {isChange && <LevelUpEffect />}
      <primitive object={scene} scale={0.7} key={scene.uuid} />
    </group>
  );
}
