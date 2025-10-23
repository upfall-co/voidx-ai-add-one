import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Group, Plane, Quaternion, Raycaster, Vector2, Vector3 } from "three";
import useMouse from "./useMouse";

export function useCursorFollow(
  agentRef: React.RefObject<Group>,
  enabled = true,
  options?: { moveSpeed?: number }
) {
  const { moveSpeed = 5 } = options ?? {};
  const pointer = useMouse();
  const { camera } = useThree();

  const plane = useMemo(() => new Plane(new Vector3(0, 1, 1), 0), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const cursorNDC = useRef(new Vector2());
  const worldPos = useRef(new Vector3());
  const targetPos = useRef(new Vector3());
  const lastQuatRef = useRef<Quaternion>(new Quaternion());
  const prevPointer = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!enabled || !agentRef.current) return;

    const agent = agentRef.current;
    const currentPointerX = (pointer.current.x / window.innerWidth) * 2 - 1;
    const currentPointerY = -(pointer.current.y / window.innerHeight) * 2 + 1;

    const moved =
      Math.abs(currentPointerX - prevPointer.current.x) > 1e-5 ||
      Math.abs(currentPointerY - prevPointer.current.y) > 1e-5;

    if (moved) {
      cursorNDC.current.set(currentPointerX, currentPointerY);
      raycaster.setFromCamera(cursorNDC.current, camera);
      raycaster.ray.intersectPlane(plane, worldPos.current);

      targetPos.current.set(worldPos.current.x, worldPos.current.y, 0);
      agent.position.lerp(targetPos.current, delta * moveSpeed);

      const dx = worldPos.current.x - agent.position.x;
      const targetYaw = Math.atan2(dx, camera.position.z - agent.position.z);
      const targetQuat = new Quaternion().setFromAxisAngle(
        new Vector3(0, 1, 0),
        targetYaw
      );

      agent.quaternion.slerp(targetQuat, delta * moveSpeed);
      lastQuatRef.current.copy(agent.quaternion);
    } else {
      agent.quaternion.slerp(lastQuatRef.current, delta * moveSpeed);
    }

    prevPointer.current = { x: currentPointerX, y: currentPointerY };
  });
}

export function useCursorFollowForMobile(
  agentRef: React.RefObject<Group>,
  enabled = true,
  options?: { moveSpeed?: number }
) {
  const { moveSpeed = 5 } = options ?? {};

  const { camera } = useThree();

  const plane = useMemo(() => new Plane(new Vector3(0, 1, 1), 0), []); // Y-up 평면이 일반적입니다.
  const raycaster = useMemo(() => new Raycaster(), []);
  const cursorNDC = useRef(new Vector2());
  const worldPos = useRef(new Vector3());
  const targetPos = useRef(new Vector3()); // 초기값은 (0,0,0)
  const lastQuatRef = useRef<Quaternion>(new Quaternion());

  const updateTargetFromScreenCoords = useCallback(
    (x: number, y: number) => {
      cursorNDC.current.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(cursorNDC.current, camera);
      if (raycaster.ray.intersectPlane(plane, worldPos.current)) {
        targetPos.current.copy(worldPos.current);
      }
    },
    [camera, plane, raycaster]
  );

  useEffect(() => {
    if (!enabled || !agentRef.current) return;

    targetPos.current.copy(agentRef.current.position);

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        updateTargetFromScreenCoords(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, [agentRef, updateTargetFromScreenCoords]);

  useFrame((_, delta) => {
    if (!agentRef.current || !enabled) return;
    const agent = agentRef.current;

    if (agent.position.distanceTo(targetPos.current) > 0.1) {
      agent.position.lerp(targetPos.current, delta * moveSpeed);

      const dx = targetPos.current.x - agent.position.x;
      const dz = targetPos.current.z - agent.position.z; // Z축도 고려
      const targetYaw = Math.atan2(dx, dz);

      const targetQuat = new Quaternion().setFromAxisAngle(
        new Vector3(0, 1, 0),
        targetYaw
      );
      agent.quaternion.slerp(targetQuat, delta * moveSpeed);
      lastQuatRef.current.copy(agent.quaternion);
    } else {
      agent.quaternion.slerp(lastQuatRef.current, delta * moveSpeed);
    }
  });
}
