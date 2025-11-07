import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Plane, Quaternion, Raycaster, Vector2, Vector3 } from "three";

export function useCursorFollow(
  agentRef: React.RefObject<Group>,
  options?: { moveSpeed?: number }
) {
  const { moveSpeed = 5 } = options ?? {};
  const { camera } = useThree();

  const [isMobile, setIsMobile] = useState(false);

  const plane = useMemo(() => new Plane(new Vector3(0, 1, 1), 0), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const cursorNDC = useRef(new Vector2());
  const worldPos = useRef(new Vector3());
  const targetPos = useRef(new Vector3());
  const lastQuatRef = useRef<Quaternion>(new Quaternion());

  const pointer = useRef({ x: 0, y: 0 });
  const prevPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = "ontouchstart" in window || window.innerWidth < 768;
      setIsMobile(mobileCheck);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !agentRef.current) return;

    const updateTargetFromScreenCoords = (x: number, y: number) => {
      cursorNDC.current.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(cursorNDC.current, camera);
      if (raycaster.ray.intersectPlane(plane, worldPos.current)) {
        targetPos.current.copy(worldPos.current);
      }
    };

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
  }, [isMobile, agentRef, camera, plane, raycaster]);

  useFrame((_, delta) => {
    if (!agentRef.current) return;
    const agent = agentRef.current;

    if (isMobile) {
      if (agent.position.distanceTo(targetPos.current) > 0.1) {
        agent.position.lerp(targetPos.current, delta * moveSpeed);

        const dx = targetPos.current.x - agent.position.x;
        const dz = targetPos.current.z - agent.position.z;
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
    } else {
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
    }
  });
}
