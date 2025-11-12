import { useInteractionStore } from "@/stores/interactionStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { findSemanticAncestor, getRole } from "@/utils/semanticUtils";
import { useEffect, useRef, useState } from "react";

/**
 * 1. 훅이 감지할 타겟 요소의 조건 (JSON 형태)
 */
export interface HoverTargets {
  classNames?: string[];
  ids?: string[];
  semanticTags?: string[]; // 예: "BUTTON", "MAIN"
  roles?: string[]; // 예: "button", "navigation"
}

/**
 * 헬퍼: 요소가 지정된 타겟 조건과 일치하는지 확인합니다.
 */
function isTarget(element: Element | null, targets: HoverTargets): boolean {
  if (!element) return false;

  // ID 검사
  if (element.id && targets.ids?.includes(element.id)) {
    return true;
  }
  // 클래스 검사
  if (targets.classNames?.some((cls) => element.classList.contains(cls))) {
    return true;
  }
  // 시맨틱 태그 검사
  if (targets.semanticTags?.includes(element.tagName)) {
    return true;
  }
  // ARIA 역할 검사
  const role = getRole(element);
  if (role && targets.roles?.includes(role)) {
    return true;
  }
  return false;
}

/**
 * 지정된 타겟 요소 위에 일정 시간 호버하면 감지하고,
 * 해당 요소와 위치를 스토어에 저장하는 훅.
 *
 * @param targets - 감지할 요소의 조건
 * @param hoverDurationMs - 호버 완료까지 필요한 시간 (ms)
 * @returns 감지 완료된 요소 (Element | null)
 */
export function useHoverDetector(
  targets: HoverTargets,
  hoverDurationMs: number = 2000
) {
  // 감지 완료된 요소를 반환
  const [detectedElement, setDetectedElement] = useState<Element | null>(null);

  // --- 스토어 액션 ---
  const setHoverTime = useInteractionStore((state) => state.setHoverTime);
  const setPosition = useSmartPopupStore((s) => s.setPosition);

  // --- 내부 상태 관리를 위한 Refs ---
  const pointRef = useRef<{ x: number; y: number } | null>(null); // 현재 마우스 커서 좌표
  const rafRef = useRef<number | null>(null); // 메인 루프(tick) rAF ID
  const lastElementRef = useRef<Element | null>(null); // 마지막 프레임에서 감지한 요소 (중복 방지)

  // --- 타이머 및 잠금(Lock) 상태 Refs ---
  const currentTargetRef = useRef<Element | null>(null); // 현재 호버 타이머가 실행 중인 대상
  const lockedElementRef = useRef<Element | null>(null); // 감지가 완료되어 "잠긴" 대상
  const timerRafRef = useRef<number | null>(null); // 호버 진행률(progress) 타이머 rAF ID
  const hoverStartRef = useRef<number | null>(null); // 호버 시작 타임스탬프

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // --- 1. 호버 진행률 타이머 로직 ---

    const cancelProgressTimer = () => {
      if (timerRafRef.current) {
        cancelAnimationFrame(timerRafRef.current);
        timerRafRef.current = null;
      }
      hoverStartRef.current = null;
    };

    /** 호버 100% 완료 시 실행되는 콜백 */
    const onTargetComplete = (element: Element) => {
      lockedElementRef.current = element; // 1. 요소를 "잠금" 처리
      setDetectedElement(element); // 2. 감지된 요소 상태 업데이트
      setHoverTime(0); // 3. 스토어의 진행률 초기화

      // 4. 스토어에 팝업 위치(현재 커서) 전송
      const pos = pointRef.current;
      console.log(pos);
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

    // --- 2. 타겟 진입/이탈 이벤트 핸들러 ---

    /** 타겟 요소 진입 시: 타이머 시작 */
    const onTargetEnter = (element: Element) => {
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

    // --- 3. 메인 감지 루프 (rAF) ---

    /** 매 프레임 실행되는 메인 감지 로직 */
    const tick = () => {
      rafRef.current = null;
      const pt = pointRef.current;
      if (!pt) return;

      // 1. 커서 위치에서 시맨틱 요소 찾기 (Shadow DOM 포함)
      let el: Element | null = document.elementFromPoint(pt.x, pt.y) || null;
      const anyEvt = window.event as any;
      const path = anyEvt?.composedPath?.() as EventTarget[] | undefined;
      if (path && path.length && path[0] instanceof Element) {
        el = path[0] as Element;
      }
      const semEl = findSemanticAncestor(el);

      // 2. 중복 실행 방지 (이전 프레임과 동일한 요소)
      if (semEl === lastElementRef.current) return;
      lastElementRef.current = semEl;

      // 3. 타겟 여부 확인
      const isMatch = isTarget(semEl, targets);
      const currentHoverEl = currentTargetRef.current;

      if (isMatch) {
        // [타겟 O]
        // 4-1. 이미 감지(잠금) 완료된 요소인지 확인
        if (semEl === lockedElementRef.current) {
          return; // 잠긴 요소이므로 타이머를 다시 시작하지 않음
        }

        // 4-2. 새로운 타겟에 진입했는지 확인
        if (semEl !== currentHoverEl) {
          onTargetLeave(); // (혹시 모를) 이전 타이머 정리
          currentTargetRef.current = semEl;
          onTargetEnter(semEl!); // 새 타겟 타이머 시작
        }
        // (semEl === currentHoverEl 인 경우는 이미 타이머가 돌고 있으므로 아무것도 안 함)
      } else {
        // [타겟 X]
        // 4-3. 이전에 타겟 위에 있었다면 (이탈)
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

    // --- 4. DOM 이벤트 리스너 ---

    const onMove = (e: PointerEvent) => {
      pointRef.current = { x: e.clientX, y: e.clientY };
      schedule(); // 메인 루프 실행 예약
    };

    const onLeave = () => {
      // 마우스가 창을 떠남
      pointRef.current = null;
      lastElementRef.current = null;
      if (currentTargetRef.current) {
        onTargetLeave();
        currentTargetRef.current = null;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true, signal });
    window.addEventListener("pointerleave", onLeave, { passive: true, signal });

    // --- 5. 클린업 ---
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
