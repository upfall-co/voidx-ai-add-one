import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type WanderOpts = {
  seed?: number;
  baseSpeed?: number;
  speedJitter?: number;
  turnRate?: number;
  circleDistance?: number;
  circleRadius?: number;
  jitter?: number;
  bounds?: { min: THREE.Vector3; max: THREE.Vector3 };
  obstacles?: THREE.Vector3[];
  avoidStrength?: number;
  onSpeedChange?: (speed: number) => void;
};

function makePRNG(seed = 1) {
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x < 0 ? ~x + 1 : x) % 1000) / 1000;
  };
}

export function useStableWander(
  group: React.RefObject<THREE.Group | null>,
  opts: WanderOpts = {}
) {
  const {
    seed = 42,
    baseSpeed = 0.7,
    speedJitter = 0.25,
    turnRate = Math.PI, // rad/s
    circleDistance = 0.3,
    circleRadius = 0.5,
    jitter = 0.15,
    bounds = {
      min: new THREE.Vector3(-2, -0.2, -2),
      max: new THREE.Vector3(2, -0.2, 2),
    },
    obstacles = [],
    avoidStrength = 1.2,
    onSpeedChange,
  } = opts;

  const initialQuat = useRef<THREE.Quaternion | null>(null);

  const rng = useRef(makePRNG(seed));
  const vel = useRef(new THREE.Vector3(1, 0, 0).multiplyScalar(baseSpeed));
  const wanderAngle = useRef(0); // 원 위의 각도 상태

  // 여러 임시 벡터/행렬 (재사용해서 GC 줄임)
  const vForward = new THREE.Vector3();
  const vRight = new THREE.Vector3();
  const vUp = new THREE.Vector3(0, 1, 0);
  const vTarget = new THREE.Vector3();
  const vCenter = new THREE.Vector3();
  const vAvoid = new THREE.Vector3();
  const vDesired = new THREE.Vector3();
  const qDesired = new THREE.Quaternion();
  const prevSpeed = useRef(0);

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;

    // dt 안전장치 (탭 전환/스톨 대비)
    const dt = Math.min(Math.max(dtRaw, 0), 1 / 20); // 최대 50ms

    // (1) 현재 전방/우측 벡터 계산
    vForward.set(0, 0, -1).applyQuaternion(g.quaternion).normalize();
    vRight.copy(vForward).cross(vUp).normalize();
    if (vRight.lengthSq() < 1e-6) vRight.set(1, 0, 0); // 특이 케이스 보호

    // (2) 앞으로 원의 중심 (월드)
    vCenter.copy(g.position).addScaledVector(vForward, circleDistance);

    // (3) 원 위 목표 각도에 잡음 추가 (재현성 RNG)
    wanderAngle.current += (rng.current() * 2 - 1) * jitter;

    // 전방 직교 평면에서 반지름/각도로 타깃 계산
    const vx = Math.cos(wanderAngle.current) * circleRadius;
    const vz = Math.sin(wanderAngle.current) * circleRadius;
    vTarget
      .copy(vCenter)
      .addScaledVector(vRight, vx)
      .addScaledVector(vUp.clone().cross(vRight).normalize(), vz); // vForward에 직교하도록

    // (4) 장애물 반발
    if (obstacles.length) {
      for (const o of obstacles) {
        vAvoid.copy(g.position).sub(o);
        const dist2 = Math.max(vAvoid.lengthSq(), 1e-4);
        vTarget.addScaledVector(vAvoid.normalize(), avoidStrength / dist2);
      }
    }

    // (5) 경계 복원력
    {
      const center = vDesired
        .copy(bounds.min)
        .add(bounds.max)
        .multiplyScalar(0.5); // 방 중심점

      const half = vAvoid.copy(bounds.max).sub(bounds.min).multiplyScalar(0.5);
      const off = vAvoid.copy(g.position).sub(center); // 에이전트 위치 - 방 중심
      if (Math.abs(off.x) > half.x || Math.abs(off.z) > half.z) {
        vTarget.add(center.sub(g.position).multiplyScalar(0.8));
      }
    }

    // (6) 속도 갱신 (목표 - 현재)
    vDesired.copy(vTarget).sub(g.position).normalize();
    const speedTarget = baseSpeed + (rng.current() * 2 - 1) * speedJitter;
    const steering = vDesired.multiplyScalar(speedTarget).sub(vel.current);
    vel.current.addScaledVector(steering, 0.1); // steering 가중치

    const maxSpeed = baseSpeed + speedJitter;
    if (vel.current.length() > maxSpeed) vel.current.setLength(maxSpeed);

    // (7) 위치 업데이트 + 바닥 고정
    g.position.addScaledVector(vel.current, dt);
    g.position.y = bounds.min.y;
    g.updateMatrixWorld(); // 부모가 matrixAutoUpdate=false여도 안전하게

    //  bounds 밖으로는 못 나가게 하드 클램프 + 반사
    if (g.position.x <= bounds.min.x || g.position.x >= bounds.max.x) {
      g.position.x = THREE.MathUtils.clamp(
        g.position.x,
        bounds.min.x,
        bounds.max.x
      );
      vel.current.x *= -1; // 벽에 부딪힌 것처럼 x 방향 반전
    }

    if (g.position.z <= bounds.min.z || g.position.z >= bounds.max.z) {
      g.position.z = THREE.MathUtils.clamp(
        g.position.z,
        bounds.min.z,
        bounds.max.z
      );
      vel.current.z *= -1; // z 방향 반전
    }

    // // (8) 진행방향을 바라보도록 회전
    // const dir =
    //   vel.current.lengthSq() > 1e-6
    //     ? vel.current.clone().normalize()
    //     : vForward;
    // // dir을 바라보는 로컬 회전 만들기
    // // dir.negate();
    // const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), dir, vUp);

    // qDesired.setFromRotationMatrix(m);
    // g.quaternion.slerp(qDesired, Math.min(1, turnRate * dt));

    // if (onSpeedChange) {
    //   const s = vel.current.length();
    //   if (Math.abs(s - prevSpeed.current) > 0.02) {
    //     onSpeedChange(s);
    //     prevSpeed.current = s;
    //   }
    // }
    // (8) 진행방향을 바라보도록 회전
    const dir =
      vel.current.lengthSq() > 1e-6
        ? vel.current.clone().normalize()
        : vForward;

    // y축 회전만 신경 쓰기 위해, 수평(XZ) 방향만 사용
    dir.y = 0;
    if (dir.lengthSq() < 1e-6) {
      // 너무 작으면 기본 전방(-Z) 사용
      dir.set(0, 0, -1);
    }
    dir.normalize();

    // 1) lookAt으로 qDesired 만들고
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), dir, vUp);
    qDesired.setFromRotationMatrix(m);

    // 2) slerp로 부드럽게 보간
    g.quaternion.slerp(qDesired, Math.min(1, turnRate * dt));

    // 3) pitch/roll 제거: 항상 수직으로 세우기
    const e = new THREE.Euler().setFromQuaternion(g.quaternion, "YXZ");
    e.x = 0;
    e.z = 0;
    g.quaternion.setFromEuler(e);
  });
}
