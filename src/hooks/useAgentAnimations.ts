import { useRef, useState } from "react";
import type { Group } from "three";

// 애니메이션 타입을 명시적으로 정의
export type AgentAnimation = "roll" | "jump" | "shake" | "squash";

export const useAgentAnimations = (modelRef: React.RefObject<Group>) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number>(null);

  // --- Vanilla JS 코드를 React Hook 스타일로 변환 ---

  const playAnimation = (type: AgentAnimation) => {
    const model = modelRef.current;
    if (!model || isAnimating) return;

    // 이전 애니메이션 프레임이 있다면 취소
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsAnimating(true);
    const originalRotation = model.rotation.clone();
    const originalPosition = model.position.clone();
    const originalScale = model.scale.clone();
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      let progress = 0;

      switch (type) {
        case "roll": {
          const duration = 500;
          progress = elapsed / duration;
          if (progress < 1) {
            model.rotation.z = originalRotation.z + progress * 2 * Math.PI;
          } else {
            model.rotation.copy(originalRotation);
          }
          break;
        }
        case "jump": {
          const duration = 400;
          const height = 0.5;
          progress = elapsed / duration;
          model.position.y =
            originalPosition.y + height * 4 * progress * (1 - progress);
          if (progress >= 1) {
            model.position.copy(originalPosition);
          }
          break;
        }
        case "shake": {
          const duration = 400;
          const intensity = 0.4;
          progress = elapsed / duration;
          model.rotation.y =
            originalRotation.y +
            Math.sin(progress * Math.PI * 4) * intensity * (1 - progress);
          if (progress >= 1) {
            model.rotation.copy(originalRotation);
          }
          break;
        }
        case "squash": {
          const duration = 300;
          progress = elapsed / duration;
          const scaleY = 1 - Math.sin(progress * Math.PI) * 0.3;
          const scaleX = 1 + Math.sin(progress * Math.PI) * 0.3;
          model.scale.set(
            originalScale.x * scaleX,
            originalScale.y * scaleY,
            originalScale.z * scaleX
          );
          if (progress >= 1) {
            model.scale.copy(originalScale);
          }
          break;
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  };

  return { isAnimating, playAnimation };
};
