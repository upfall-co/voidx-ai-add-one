import { useInteractionStore } from "@/stores/interactionStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { useEffect, useRef, useState } from "react";

export interface HoverTargets {
  classNamePatterns?: RegExp[];
  idPatterns?: RegExp[];
  classNames?: string[];
  ids?: string[];
}

function isTarget(element: Element | null, targets: HoverTargets): boolean {
  if (!element) return false;

  // 1. [기존] ID (정확히 일치)
  if (element.id && targets.ids?.includes(element.id)) {
    return true;
  }

  // 2. [기존] Class (정확히 일치)
  if (targets.classNames?.some((cls) => element.classList.contains(cls))) {
    return true;
  }

  // element.id가 존재하고, idPatterns 배열의 정규식 중 하나라도 통과하는지 검사
  if (
    element.id &&
    targets.idPatterns?.some((pattern) => pattern.test(element.id))
  ) {
    return true;
  }

  // classNamePatterns 배열의 정규식 중 하나라도 통과하는 클래스가 있는지 검사
  if (targets.classNamePatterns && element.classList.length > 0) {
    const hasMatchingClass = Array.from(element.classList).some((cls) =>
      targets.classNamePatterns!.some((pattern) => pattern.test(cls))
    );

    if (hasMatchingClass) {
      return true;
    }
  }

  return false;
}

export function useHoverDetector(
  targets: HoverTargets,
  hoverDurationMs: number = 2000
) {
  // 감지 완료된 요소를 반환
  const [detectedElement, setDetectedElement] = useState<Element | null>(null);

  // --- 스토어 액션 ---
  const setHoverTime = useInteractionStore((state) => state.setHoverTime);
  const setPosition = useSmartPopupStore((s) => s.setPosition);

  const pointRef = useRef<{ x: number; y: number } | null>(null); // 현재 마우스 커서 좌표
  const rafRef = useRef<number | null>(null); // 메인 루프(tick) rAF ID

  const prevFrameElementRef = useRef<Element | null>(null); // 마지막 프레임에서 감지한 요소 (중복 방지)
  const completedElementRef = useRef<Element | null>(null); // 감지가 완료되어 "잠긴" 대상

  const currentTargetRef = useRef<Element | null>(null); // 현재 호버 타이머가 실행 중인 대상
  const timerRafRef = useRef<number | null>(null); // 호버 진행률(progress) 타이머 rAF ID
  const hoverStartRef = useRef<number | null>(null); // 호버 시작 타임스탬프

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const cancelProgressTimer = () => {
      if (timerRafRef.current) {
        cancelAnimationFrame(timerRafRef.current);
        timerRafRef.current = null;
      }
      hoverStartRef.current = null;
    };

    /** 호버 100% 완료 시 실행되는 콜백 */
    const onTargetComplete = (element: Element) => {
      completedElementRef.current = element; // 1. 요소를 "잠금" 처리
      setDetectedElement(element); // 2. 감지된 요소 상태 업데이트
      setHoverTime(0); // 3. 스토어의 진행률 초기화
      // 4. 스토어에 팝업 위치(현재 커서) 전송
      const pos = pointRef.current;
      if (pos) {
        setPosition(pos);
      }
    };

    /** 호버 진행률 타이머 (rAF 루프) */
    const runProgressTimer = () => {
      const startTime = hoverStartRef.current;
      // 타이머가 시작되지 않았거나, 대상 엘리먼트가 사라졌으면 중단
      if (!startTime || !currentTargetRef.current) {
        cancelProgressTimer();
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / hoverDurationMs) * 100, 100);

      setHoverTime(progress); // 스토어에 진행률 업데이트

      if (progress >= 100) {
        onTargetComplete(currentTargetRef.current); // 100% 달성!
        cancelProgressTimer();
      } else {
        timerRafRef.current = requestAnimationFrame(runProgressTimer);
      }
    };

    /** 타겟 요소 진입 시: 타이머 시작 */
    const onTargetEnter = () => {
      cancelProgressTimer(); // 기존 타이머 취소
      hoverStartRef.current = Date.now();
      setHoverTime(0);
      timerRafRef.current = requestAnimationFrame(runProgressTimer);
    };

    /** 타겟 요소 이탈 시: 타이머 취소 및 초기화 */
    const onTargetLeave = () => {
      cancelProgressTimer();
      setHoverTime(0);
    };
    /** 매 프레임 실행되는 메인 감지 로직 */
    const tick = () => {
      rafRef.current = null;
      const pt = pointRef.current;
      if (!pt) return;

      // 1. 커서 위치에서 요소 찾기 (Shadow DOM 포함)
      let el: Element | null = document.elementFromPoint(pt.x, pt.y) || null;

      // 1-b. 커서 위치(el)부터 시작하여 상위로 올라가며 타겟(targets)과 일치하는 요소를 찾음
      let targetEl: Element | null = el;
      while (targetEl && !isTarget(targetEl, targets)) {
        // [수정됨] isTarget은 이제 정규식을 포함하여 검사합니다.
        targetEl = targetEl.parentElement;
      }

      // 2. 중복 실행 방지 (이전 프레임과 동일한 요소)
      if (targetEl === prevFrameElementRef.current) return;
      prevFrameElementRef.current = targetEl;

      // 3. 타겟 여부 확인
      const currentHoverEl = currentTargetRef.current;

      if (targetEl) {
        // [타겟 O]
        // 4-1. 이미 감지(잠금) 완료된 요소인지 확인
        if (targetEl === completedElementRef.current) {
          return; // 잠긴 요소이므로 타이머를 다시 시작하지 않음
        }

        // 4-2. 새로운 타겟에 진입했는지 확인
        if (targetEl !== currentHoverEl) {
          onTargetLeave(); // (혹시 모를) 이전 타이머 정리
          currentTargetRef.current = targetEl;
          onTargetEnter(); // 새 타겟 타이머 시작
        }
      } else {
        if (currentHoverEl) {
          currentTargetRef.current = null;
          onTargetLeave();
        }
      }
    };

    /** 메인 루프 스케줄러 */
    const schedule = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      pointRef.current = { x: e.clientX, y: e.clientY };
      schedule(); // 메인 루프 실행 예약
    };

    const onLeave = () => {
      // 마우스가 창을 떠남
      pointRef.current = null;
      prevFrameElementRef.current = null;
      if (currentTargetRef.current) {
        onTargetLeave();
        currentTargetRef.current = null;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true, signal });
    window.addEventListener("pointerleave", onLeave, { passive: true, signal });

    return () => {
      controller.abort(); // 모든 이벤트 리스너 제거
      cancelProgressTimer(); // 진행률 타이머 제거
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      setHoverTime(0); // 훅 언마운트 시 스토어 초기화
    };
  }, [targets, hoverDurationMs, setHoverTime, setPosition]);

  return detectedElement;
}
