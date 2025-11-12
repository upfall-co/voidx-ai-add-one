// components/ActivityRing.tsx
import { useMemo } from "react";
import * as THREE from "three";

type Props = {
  /** useStableWander의 bounds 그대로 넘겨주세요 */
  bounds: { min: THREE.Vector3; max: THREE.Vector3 };
  /** 경계선 두께(링 폭) */
  thickness?: number;
  /** 반지름 여유(박스에 딱 맞추면 끼임 방지용) */
  margin?: number;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  segments?: number;
  /** 직접 원형 경계를 쓰고 싶다면 center/radius로 오버라이드 */
  centerOverride?: THREE.Vector3;
  radiusOverride?: number;
};

export default function ActivityRing({
  bounds,
  thickness = 0.03,
  margin = 0.02,
  color = "#00E5FF",
  opacity = 0.85,
  segments = 96,
  centerOverride,
  radiusOverride,
}: Props) {
  // 1) 직사각형 bounds → 중심/반경 계산 (최대 내접 원)
  const { center, radius, y } = useMemo(() => {
    const center = bounds.min.clone().add(bounds.max).multiplyScalar(0.5);
    const half = bounds.max.clone().sub(bounds.min).multiplyScalar(0.5);
    const r = Math.max(0.001, Math.min(half.x, half.z) - margin);
    return { center, radius: r, y: bounds.min.y };
  }, [bounds, margin]);

  const finalCenter = centerOverride ?? center;
  const finalRadius = Math.max(0.001, radiusOverride ?? radius);

  // 2) 링 지오메트리 (바닥에 평평하게: X축으로 -90도 회전)
  const geom = useMemo(
    () =>
      new THREE.RingGeometry(finalRadius - thickness, finalRadius, segments),
    [finalRadius, thickness, segments]
  );
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [color, opacity]
  );

  return (
    <mesh
      geometry={geom}
      material={mat}
      position={[finalCenter.x, y, finalCenter.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}
