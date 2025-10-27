"use client";

const dracoUrl = `${cdnUrl}/3d/level-react-draco.glb`;

import { cdnUrl } from "@/constant/common";
import { useVoidxAgentStore } from "@/stores/voidxAgentStore";
import { a, useSpring } from "@react-spring/three";
import {
  MeshWobbleMaterial,
  PresentationControls,
  useCursor,
  useGLTF,
  useMatcapTexture,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import AgentModel from "./AgentModel";

export default function TestRoom() {
  const isSleeping = useVoidxAgentStore((s) => s.isSleeping);
  const setIsSleeping = useVoidxAgentStore((s) => s.setIsSleeping);
  const agentUrl = useVoidxAgentStore((s) => s.agentUrl);
  console.log("[voidx] dracoUrl =", dracoUrl);

  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  useEffect(() => {
    setIsSleeping(false);
  }, [setIsSleeping]);

  return (
    <Suspense fallback={null}>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 15, position: [0, 0, 10] }}
        style={{ touchAction: "none" }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[10, 8, 5]} />
        <PresentationControls
          global
          zoom={0.8}
          rotation={[0, -Math.PI / 4, 0]}
          polar={[0, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
          cursor={false}
        >
          <group position-y={-1} dispose={null}>
            {isSleeping && <AgentModel url={agentUrl} />}
            <Camera />
            <Level />
            <Cactus onSelect={setSelectedObject} />
            <Icon onSelect={setSelectedObject} />
            <Sudo onSelect={setSelectedObject} />
            <Pyramid onSelect={setSelectedObject} />
          </group>
        </PresentationControls>
        <RendererCleanup />
      </Canvas>
    </Suspense>
  );
}

function Sudo({ onSelect }: { onSelect: (name: string) => void }) {
  const { nodes } = useGLTF(dracoUrl);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const [{ scale }, scaleApi] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 280, friction: 20 },
  }));

  const [spring, rotationApi] = useSpring(
    () => ({
      rotation: [Math.PI / 2, 0, 0.29],
      config: { friction: 40, tension: 120 },
    }),
    []
  );

  useEffect(() => {
    const wander = () => {
      rotationApi.start({
        rotation: [
          Math.PI / 2 + THREE.MathUtils.randFloatSpread(2) * 0.3,
          0,
          0.29 + THREE.MathUtils.randFloatSpread(2) * 0.2,
        ],
      });
    };
    const timeout = setTimeout(wander, (1 + Math.random() * 3) * 1000);
    wander();
    return () => clearTimeout(timeout);
  }, [rotationApi]);

  return (
    <a.group
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        scaleApi.start({ scale: 10 });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        scaleApi.start({ scale: 1 });
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("Sudo");
      }}
    >
      <mesh
        geometry={(nodes.Sudo as THREE.Mesh).geometry}
        material={(nodes.Sudo as THREE.Mesh).material}
        position={[0.68, 0.33, -0.67]}
        rotation={[Math.PI / 2, 0, 0.29]}
      />
      <a.mesh
        geometry={(nodes.SudoHead as THREE.Mesh).geometry}
        material={(nodes.SudoHead as THREE.Mesh).material}
        position={[0.68, 0.33, -0.67]}
        rotation={spring.rotation as any}
      />
    </a.group>
  );
}

function Cactus({ onSelect }: { onSelect: (name: string) => void }) {
  const { nodes, materials } = useGLTF(dracoUrl);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const { scale } = useSpring({
    scale: hovered ? 1.2 : 1,
    config: { mass: 1, tension: 280, friction: 20 },
  });

  return (
    <a.mesh
      scale={scale}
      geometry={(nodes.Cactus as THREE.Mesh).geometry}
      position={[-0.42, 0.51, -0.62]}
      rotation={[Math.PI / 2, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("Cactus");
      }}
    >
      <MeshWobbleMaterial
        factor={0.4}
        map={(materials.Cactus as THREE.MeshStandardMaterial).map}
      />
    </a.mesh>
  );
}

function Camera() {
  const { nodes, materials } = useGLTF(dracoUrl);
  const [spring, api] = useSpring(
    () => ({ "rotation-z": 0, config: { friction: 40 } }),
    []
  );
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const wander = () => {
      api.start({ "rotation-z": Math.random() });
      timeout = setTimeout(wander, (1 + Math.random() * 5) * 1000);
    };
    wander();
    return () => clearTimeout(timeout);
  }, [api]);
  return (
    <a.group
      position={[-0.58, 0.83, -0.03]}
      rotation={[Math.PI / 2, 0, 0.47]}
      {...spring}
    >
      <mesh
        geometry={(nodes.Camera as THREE.Mesh).geometry}
        material={(nodes.Camera as THREE.Mesh).material}
      />
      <mesh
        geometry={(nodes.Camera_1 as THREE.Mesh).geometry}
        material={materials.Lens}
      />
    </a.group>
  );
}

function Icon({ onSelect }: { onSelect: (name: string) => void }) {
  const { nodes } = useGLTF(dracoUrl);
  const [matcap] = useMatcapTexture("65A0C7_C3E4F8_A7D5EF_97CAE9", 1024);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const [springs, api] = useSpring(() => ({
    scale: 1,
    rotation: [0.8, 1.1, -0.4],
    position: [-0.79, 1.3, 0.62],
    config: { mass: 2, tension: 200 },
  }));
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let floating = false;
    const bounce = () => {
      api.start({
        rotation: [0.8 - (floating ? 0.3 : 0), 1.1, -0.4],
        position: [-0.79, floating ? 1.4 : 1.3, 0.62],
      });
      floating = !floating;
      timeout = setTimeout(bounce, 1.5 * 1000);
    };
    bounce();
    return () => clearTimeout(timeout);
  }, [api]);

  return (
    <a.mesh
      geometry={(nodes.React as THREE.Mesh).geometry}
      {...(springs as any)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        api.start({ scale: 1.2 });
      }}
      onPointerOut={() => {
        setHovered(false);
        api.start({ scale: 1 });
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("React Icon");
      }}
    >
      <meshMatcapMaterial matcap={matcap} />
    </a.mesh>
  );
}

function Pyramid({ onSelect }: { onSelect: (name: string) => void }) {
  const { nodes } = useGLTF(dracoUrl);
  const [matcap] = useMatcapTexture("489B7A_A0E7D9_6DC5AC_87DAC7", 1024);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const [spring, api] = useSpring(
    () => ({
      scale: 1,
      rotation: [0, 0, 0],
      config: { mass: 5, tension: 200 },
    }),
    []
  );
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const rotate = () => {
      api.start({
        rotation: [
          (Math.random() - 0.5) * Math.PI * 3,
          0,
          (Math.random() - 0.5) * Math.PI * 3,
        ],
      });
      timeout = setTimeout(rotate, (0.5 + Math.random() * 2) * 1000);
    };
    rotate();
    return () => void clearTimeout(timeout);
  }, [api]);
  return (
    <a.mesh
      geometry={(nodes.Pyramid as THREE.Mesh).geometry}
      position={[-0.8, 1.33, 0.25]}
      {...(spring as any)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        api.start({ scale: 1.2 });
      }}
      onPointerOut={() => {
        setHovered(false);
        api.start({ scale: 1 });
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("Pyramid");
      }}
    >
      <meshMatcapMaterial matcap={matcap} />
    </a.mesh>
  );
}

function Level() {
  const { nodes } = useGLTF(dracoUrl);
  const { camera } = useThree();
  useSpring(
    () => ({
      from: { y: camera.position.y + 5 },
      to: { y: camera.position.y },
      config: { friction: 100 },
      onChange: ({ value }) => (
        (camera.position.y = value.y), camera.lookAt(0, 0, 0)
      ),
    }),
    []
  );
  return (
    <mesh
      geometry={(nodes.Level as THREE.Mesh).geometry}
      material={(nodes.Level as THREE.Mesh).material}
      position={[-0.38, 0.69, 0.62]}
      rotation={[Math.PI / 2, -Math.PI / 9, 0]}
    />
  );
}

function RendererCleanup() {
  const { gl } = useThree();

  useEffect(() => {
    return () => {
      gl.dispose();
    };
  }, [gl]);

  return null;
}
