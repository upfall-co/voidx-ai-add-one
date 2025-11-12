import { useCursorFollow } from "@/hooks/useCursorFollow";
import { useInteractionStore } from "@/stores/scenarioStore";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LevelUpEffect } from "./LevelUpEffect";

type CursorAgentModelProps = {
  url: string;
  asleep: boolean; // 1. asleep prop 타입 추가
};

export default function CursorAgentModel({ url }: CursorAgentModelProps) {
  const [isChange, setIsChange] = useState(false);
  const agentRef = useRef<THREE.Group>(null!);
  const level = useInteractionStore((s) => s.level);
  const prevLevelRef = useRef(Math.floor(level));

  useCursorFollow(agentRef);

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
    <group ref={agentRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.6}>
      {isChange && <LevelUpEffect />}
      <GhostScene url={url} />
    </group>
  );
}

export function GhostScene({ url }: { url: string }) {
  const level = useInteractionStore((s) => s.level);
  const groupRef = useRef<THREE.Group>(null!);

  const { scene, nodes, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, groupRef);

  const currentLevel = Math.floor(level);

  useEffect(() => {
    const animationName = "ArmatureAction";

    const action = actions[animationName];

    if (action) {
      action.timeScale = 4;
      action.reset().fadeIn(0.5).play();
      return () => {
        action.fadeOut(0.5);
      };
    } else {
      console.warn(`[GhostScene] Animation "${animationName}" not found!`);
      console.log("Available animations:", Object.keys(actions));
    }
  }, [actions]);

  useEffect(() => {
    const currentLevelInt = Math.floor(currentLevel);

    scene.traverse((obj) => {
      if (obj.name === "sunglasses") {
        (obj as THREE.Mesh).visible = currentLevelInt >= 2;
      }
      if (obj.name === "sweep") {
        (obj as THREE.Mesh).visible = currentLevelInt >= 3;
      }
      if (obj.name === "material2") {
        (obj as THREE.Mesh).visible = currentLevelInt >= 4;
      }
    });
  }, [currentLevel, nodes, scene]);

  if (!scene) return null;

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// export function GhostScene({ url }: { url: string }) {
//   const level = useBeautyScenarioStore((s) => s.level);
//   const { nodes } = useGLTF(url);

//   const modelRotation = (nodes?.Armature as THREE.Group)?.rotation;
//   const modelScale = (nodes?.Armature as THREE.Group)?.scale;

//   const currentLevel = Math.floor(level);

//   useEffect(() => {
//     console.log(nodes);
//   }, []);

//   if (!nodes || !modelRotation || !modelScale) return null;

//   return (
//     <group>
//       <mesh
//         name="arms"
//         geometry={(nodes.arms as THREE.Mesh).geometry}
//         material={(nodes.arms as THREE.Mesh).material}
//         position={(nodes.arms as THREE.Mesh).position}
//       />
//       <mesh
//         name="body"
//         geometry={(nodes.body as THREE.Mesh).geometry}
//         material={(nodes.body as THREE.Mesh).material}
//         position={(nodes.body as THREE.Mesh).position}
//       />
//       <mesh
//         name="eyes"
//         geometry={(nodes.eyes as THREE.Mesh).geometry}
//         material={(nodes.eyes as THREE.Mesh).material}
//         position={(nodes.eyes as THREE.Mesh).position}
//       />
//       <mesh
//         name="eyes_2"
//         geometry={(nodes.eyes_2 as THREE.Mesh).geometry}
//         material={(nodes.eyes_2 as THREE.Mesh).material}
//         position={(nodes.eyes_2 as THREE.Mesh).position}
//       />
//       <mesh
//         name="legs"
//         geometry={(nodes.legs as THREE.Mesh).geometry}
//         material={(nodes.legs as THREE.Mesh).material}
//         position={(nodes.legs as THREE.Mesh).position}
//       />

//       {currentLevel >= 2 && nodes.sunglasses && (
//         <mesh
//           name="sunglasses"
//           geometry={(nodes.sunglasses as THREE.Mesh).geometry}
//           material={(nodes.sunglasses as THREE.Mesh).material}
//           position={(nodes.sunglasses as THREE.Mesh).position}
//         />
//       )}

//       {currentLevel >= 3 && nodes.sweep && (
//         <mesh
//           name="sweep"
//           geometry={(nodes.sweep as THREE.Mesh).geometry}
//           material={(nodes.sweep as THREE.Mesh).material}
//           position={(nodes.sweep as THREE.Mesh).position}
//         />
//       )}

//       {currentLevel >= 4 && nodes.material2 && (
//         <mesh
//           name="material2"
//           geometry={(nodes.material2 as THREE.Mesh).geometry}
//           material={(nodes.material2 as THREE.Mesh).material}
//           position={(nodes.material2 as THREE.Mesh).position}
//         />
//       )}
//     </group>
//   );
// }
