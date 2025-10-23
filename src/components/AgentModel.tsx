import {
  useAgentAnimations,
  type AgentAnimation,
} from "@/hooks/useAgentAnimations";
import { useVoidxAgentStore } from "@/stores/voidxAgentStore";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Object3DEventMap } from "three";

export type AgentHandle = {
  jumpTwice: () => Promise<void>;
};

export type AgentModelProps = {
  url: string;
};

function useClone(scene: Group<Object3DEventMap>) {
  return useMemo(() => scene.clone(true) as Group<Object3DEventMap>, [scene]);
}

const AgentModel = ({ url }: { url: string }) => {
  const agentRef = useRef<Group>(null!);
  const { scene } = useGLTF(url);

  const clonedScene = useClone(scene);
  const setLevel = useVoidxAgentStore((s) => s.setLevel);

  const { playAnimation } = useAgentAnimations(agentRef);
  const animations: AgentAnimation[] = ["jump", "roll", "squash", "shake"];
  const [animationIndex, setAnimationIndex] = useState(0);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const currentAnimation = animations[animationIndex];
    playAnimation(currentAnimation);
    setAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length);
    setLevel((prev) => prev + 0.1);
  };

  useFrame(() => {
    if (!agentRef.current) return;
    agentRef.current.position.set(0.2, 0.5, -0.4);
  });

  useEffect(() => {
    agentRef.current.rotation.set(0, 0, 0);
    clonedScene.scale.set(0.3, 0.3, 0.3);
    return () => {
      clonedScene.scale.set(1, 1, 1);
      clonedScene.position.set(0, 0, 0);
    };
  }, [url]);

  return (
    <primitive
      onPointerDown={handlePointerDown}
      ref={agentRef}
      object={clonedScene}
    />
  );
};

export default AgentModel;
