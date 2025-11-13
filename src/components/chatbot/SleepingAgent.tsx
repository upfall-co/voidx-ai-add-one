// SleepingAgentModel.tsx
import { useStableWander } from "@/hooks/useStableWander";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GhostScene } from "../agent/CursorAgentModel";

const FLOOR_Y = -0.3; // 방 바닥 높이(대충 -0.2~-0.3 사이라 중간값으로 설정)

// 방 전체를 대충 감싸는 박스 (원하면 더 좁혀도 됨)
const ROOM_BOUNDS = {
  min: new THREE.Vector3(-0.75, FLOOR_Y, -0.75),
  max: new THREE.Vector3(0.75, FLOOR_Y, 0.75),
};

// 콘솔에서 찍힌 월드 좌표를 기반으로 한 장애물들
// (x, z 그대로 쓰고, y만 FLOOR_Y로 맞춤)
const OBSTACLES: THREE.Vector3[] = [
  // // beanbag_remesh:  x: 0.7869, z: 0.6601
  // new THREE.Vector3(0.79, FLOOR_Y, 0.66),

  // // book: x: -0.6840, z: -0.6574  (소파 쪽)
  // new THREE.Vector3(-0.68, FLOOR_Y, -0.66),

  // bookshelf: x: 0.0687, z: -0.8221
  // new THREE.Vector3(0.07, FLOOR_Y, -0.82),

  // chair / chair_b 두 개 거의 같은 위치라 하나만 대표로
  // chair: x: -0.6075, z: 0.3739
  new THREE.Vector3(-0.61, FLOOR_Y, 0.37),

  // curve 쪽 (문/아치 비슷한 애일 가능성)
  // curve: x: -0.5375, z: -0.3543
  // new THREE.Vector3(-0.54, FLOOR_Y, -0.35),

  // // table: x: 0.5513, z: -0.1287
  // new THREE.Vector3(0.55, FLOOR_Y, -0.13),

  // // th: x: 0.6140, z: -0.0304 (테이블 옆의 소품?)
  // new THREE.Vector3(0.61, FLOOR_Y, -0.03),
];

const SleepingAgentModel = ({ url }: { url: string }) => {
  const moverRef = useRef<THREE.Group>(null!);

  useStableWander(moverRef, {
    bounds: ROOM_BOUNDS,
    obstacles: OBSTACLES,
    avoidStrength: 0.4, // 너무 가깝게 붙으면 2.5~3.0으로 올려봐도 됨
    baseSpeed: 0.7,
    speedJitter: 0.25,
  });

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
