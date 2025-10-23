import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/** 공통: 부드러운 이징 */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 링(Shockwave)용 간단 셰이더: 중앙에서 바깥으로 퍼지는 링 + 퍼지 테두리 */
function makeRingMaterial(color = new THREE.Color("#8ec5ff")) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: color },
      uRadius: { value: 0.1 }, // 0.0 ~ 1.2 정도
      uThickness: { value: 0.08 },
      uOpacity: { value: 1.0 },
      uSoftness: { value: 0.015 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0; // -1~1
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uRadius;
      uniform float uThickness;
      uniform float uOpacity;
      uniform float uSoftness;

      // 링: |r - uRadius| 가 uThickness 안쪽일 때 밝음. 가장자리는 softstep으로 그라데이션
      void main() {
        float r = length(vUv);
        float edge = abs(r - uRadius);
        float core = smoothstep(uThickness, uThickness - uSoftness, edge);
        vec3 col = uColor;
        float a = core * uOpacity;
        if (a <= 0.001) discard;
        gl_FragColor = vec4(col, a);
      }
    `,
  });
  return mat;
}

/** 플래시(순간 번쩍)용 머티리얼 */
function makeFlashMaterial(color = new THREE.Color("#ffffff")) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: color },
      uOpacity: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uOpacity;
      void main(){
        float r = length(vUv);
        // 중심이 더 밝고, 바깥으로 갈수록 잦아드는 라디얼 그라데이션
        float g = smoothstep(1.0, 0.0, r);
        float a = g * uOpacity;
        if(a <= 0.001) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
  return mat;
}

export function LevelUpEffect({
  /** 전체 재생 시간(초) */
  duration = 1.2,
  /** 링 최대 반경(월드 좌표) */
  maxRadius = 2.2,
  /** 링 색상 */
  color = "#f2ff3c",
  /** 스파클 색상 */
  sparkleColor = "#ffffff",
  /** 완료 콜백(1회) */
  onComplete,
}: {
  duration?: number;
  maxRadius?: number;
  color?: string;
  sparkleColor?: string;
  onComplete?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // 링/플래시용 플레인(정사각형) 지오메트리
  const planeGeo = useMemo(() => new THREE.PlaneGeometry(4, 4, 1, 1), []);

  // 링 머티리얼 / 플래시 머티리얼
  const ringMat = useMemo(
    () => makeRingMaterial(new THREE.Color(color)),
    [color]
  );
  const flashMat = useMemo(
    () => makeFlashMaterial(new THREE.Color("#ffffff")),
    []
  );

  // 스파클(작은 구) 인스턴스
  const SPARK_COUNT = 80;
  const sparkGeo = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), []);
  const sparkMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      color: new THREE.Color(sparkleColor),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return m;
  }, [sparkleColor]);

  const sparksRef = useRef<THREE.InstancedMesh>(null);
  const sparkVel = useRef<Float32Array>(null); // x,y,z 속도
  const sparkScale0 = 0.8;

  // 레이(방사형 빛줄기) 인스턴스
  const RAY_COUNT = 16;
  const rayGeo = useMemo(() => new THREE.PlaneGeometry(1, 0.08), []);
  const rayMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color]
  );
  const raysRef = useRef<THREE.InstancedMesh>(null);

  // 초기화: 스파클/레이 방향, 속도 시드
  useEffect(() => {
    // 스파클 속도 시드
    const v = new Float32Array(SPARK_COUNT * 3);
    for (let i = 0; i < SPARK_COUNT; i++) {
      // XY 평면 위로 퍼지되, 살짝 Z도 랜덤
      const theta = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0; // 2~5
      const zJitter = (Math.random() - 0.5) * 0.8;
      v[i * 3 + 0] = Math.cos(theta) * speed;
      v[i * 3 + 1] = Math.sin(theta) * speed;
      v[i * 3 + 2] = zJitter;
    }
    sparkVel.current = v;

    // 레이 초기 트랜스폼(각도만 세팅)
    if (raysRef.current) {
      const m = new THREE.Matrix4();
      for (let i = 0; i < RAY_COUNT; i++) {
        const theta = (i / RAY_COUNT) * Math.PI * 2;
        m.identity()
          .makeRotationZ(theta)
          .multiply(new THREE.Matrix4().makeTranslation(0.5, 0, 0)); // 길이 방향으로 반쯤 밀어둠
        raysRef.current.setMatrixAt(i, m);
      }
      raysRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  const startMs = useRef<number | null>(null);
  const done = useRef(false);

  useFrame((_, dt) => {
    if (startMs.current === null) startMs.current = performance.now();
    const tSec = (performance.now() - startMs.current) / 1000;
    const n = clamp01(tSec / duration); // 0~1
    const e = easeOutCubic(n); // 부드러운 진행률

    // 1) 플래시: 초반 강하게 -> 빠르게 감소
    const flashScale = 0.6 + e * 1.0; // 0.6 -> 1.6
    const flashOpacity = n < 0.15 ? 0.9 : Math.max(0, 0.9 - (n - 0.15) * 2.5); // 0~0.15 구간 최대, 이후 빨리 감쇠

    flashMat.uniforms.uOpacity.value = flashOpacity;
    // 그룹 스케일로 제어(정사각형이라 간편)
    // flash는 살짝 더 작게
    const flashObj = (groupRef.current?.children[0] as THREE.Mesh) || null;
    if (flashObj) {
      flashObj.scale.setScalar(flashScale);
    }

    // 2) 링(Shockwave): 반경 증가, 두께 얇아짐, 불투명도 감소
    const r = e * 0.9; // 셰이더 안에서 -1~1 공간이므로 1.15면 살짝 넘치게
    ringMat.uniforms.uRadius.value = r;
    ringMat.uniforms.uThickness.value = THREE.MathUtils.lerp(0.12, 0.02, e);
    ringMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(1.0, 0.0, n);
    // 링의 실제 월드 반경 느낌을 맞추기 위해 그룹 전체 스케일로 조절
    const worldScale = THREE.MathUtils.lerp(0.6, maxRadius, e);
    if (groupRef.current) groupRef.current.scale.setScalar(worldScale);

    // 3) 레이(빛줄기): 길이/불투명도 애니
    if (raysRef.current) {
      const m = new THREE.Matrix4();
      const s = new THREE.Vector3();
      const q = new THREE.Quaternion();
      const p = new THREE.Vector3();
      const rayLen = THREE.MathUtils.lerp(
        0.0,
        1.2,
        easeOutCubic(Math.min(n * 1.2, 1))
      );
      const rayOpacity = 1.0 - n;
      (rayMat as THREE.MeshBasicMaterial).opacity = rayOpacity * 0.8;

      for (let i = 0; i < RAY_COUNT; i++) {
        const theta = (i / RAY_COUNT) * Math.PI * 2;
        q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), theta);
        s.set(rayLen, 1, 1);
        p.set(0, 0, 0);
        m.compose(p, q, s).multiply(
          new THREE.Matrix4().makeTranslation(0.5, 0, 0)
        );
        raysRef.current.setMatrixAt(i, m);
      }
      raysRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4) 스파클: 바깥으로 튀면서 감쇠 & 축소
    if (sparksRef.current && sparkVel.current) {
      const m = new THREE.Matrix4();
      const p = new THREE.Vector3();
      const s = new THREE.Vector3();
      const q = new THREE.Quaternion();
      const friction = 0.98;

      for (let i = 0; i < SPARK_COUNT; i++) {
        // 진행률을 조금 랜덤 위상으로 변주해 더 자연스럽게
        const life = clamp01(n * (0.85 + (i % 7) * 0.02));
        const idx = i * 3;
        const vx = (sparkVel.current[idx + 0] *= friction);
        const vy = (sparkVel.current[idx + 1] *= friction);
        const vz = (sparkVel.current[idx + 2] *= friction);

        // dt로 이동
        p.set(vx * dt, vy * dt, vz * dt);
        // 인스턴스는 절대 좌표 누적이 없으니, 진행률 기반 반경 배치로 구현
        const theta = Math.atan2(vy, vx);
        const radius = (0.1 + life * 1.6) * (0.7 + (i % 5) * 0.06);
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;
        const z = vz * 0.08;

        // 축소 & 약간의 깜빡임
        const scale = sparkScale0 * (1.0 - life) * (0.6 + (i % 3) * 0.1);
        s.setScalar(Math.max(0.0001, scale));
        q.identity();
        m.compose(new THREE.Vector3(x, y, z), q, s);
        sparksRef.current.setMatrixAt(i, m);
      }
      (sparkMat as THREE.MeshBasicMaterial).opacity = 1.0 - n; // 전체 감쇠
      sparksRef.current.instanceMatrix.needsUpdate = true;
    }

    // 종료
    if (n >= 1 && !done.current) {
      done.current = true;
      onComplete?.();
      groupRef.current?.parent?.remove(groupRef.current);
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.5, 0]}>
      {/* Flash */}
      <mesh geometry={planeGeo} material={flashMat} />

      {/* Shockwave Ring */}
      <mesh geometry={planeGeo} material={ringMat} />

      {/* Rays */}
      <instancedMesh
        ref={raysRef}
        args={[rayGeo, rayMat, RAY_COUNT]}
        frustumCulled={false}
      />

      {/* Sparks */}
      <instancedMesh
        ref={sparksRef}
        args={[sparkGeo, sparkMat, SPARK_COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}
