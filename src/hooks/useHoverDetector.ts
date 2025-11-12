import { useInteractionStore } from "@/stores/interactionStore";
import { findSemanticAncestor, getRole } from "@/utils/semanticUtils"; // (2) 유틸 경로
import { useEffect, useRef } from "react";

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
 * 헬퍼 함수: 요소가 타겟 조건에 맞는지 검사
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
 * 지정된 타겟 요소 위에서 N초간 호버하면 감지하고 콘솔에 출력하는 훅
 * @param targets - 감지할 요소의 조건 (ID, 클래스, 태그, 역할)
 * @param hoverDurationMs - 호버 완료까지 필요한 시간 (ms)
 */
export function useHoverDetector(
  targets: HoverTargets,
  hoverDurationMs: number = 2000
) {
  // 3. Zustand 스토어에서 setHoverTime 액션 가져오기
  const setHoverTime = useInteractionStore((state) => state.setHoverTime);

  // --- 내부 상태 관리를 위한 Refs ---
  const pointRef = useRef<{ x: number; y: number } | null>(null); // 현재 마우스 위치
  const rafRef = useRef<number | null>(null); // 메인 rAF (tick)
  const lastElementRef = useRef<Element | null>(null); // 중복 감지 방지용 (마지막 프레임)

  // --- 타이머 및 잠금(Lock) 상태 Refs ---
  const currentTargetRef = useRef<Element | null>(null); // 현재 호버 중인 *타겟*
  const lockedElementRef = useRef<Element | null>(null); // 5. 100% 완료되어 잠긴 요소
  const timerRafRef = useRef<number | null>(null); // 3. 프로그레스 타이머 rAF
  const hoverStartRef = useRef<number | null>(null); // 호버 시작 시간 (Date.now())

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // --- 3, 4. 프로그레스 타이머 로직 ---
    const cancelProgressTimer = () => {
      if (timerRafRef.current) {
        cancelAnimationFrame(timerRafRef.current);
        timerRafRef.current = null;
      }
      hoverStartRef.current = null;
    };

    /** 5, 6. 호버 100% 완료 시 실행되는 함수 */
    const onTargetComplete = (element: Element) => {
      lockedElementRef.current = element; // 5. 엘리먼트 저장 (잠금)
      console.log("✅ Hover Locked:", element); // 6. 콘솔 출력
      setHoverTime(0); // 7. hoverTime 초기화
    };

    /** 3. 프로그레스 타이머 실행 (rAF 루프) */
    const runProgressTimer = () => {
      const startTime = hoverStartRef.current;
      // 타이머가 시작되지 않았거나, 대상 엘리먼트가 사라졌으면 중단
      if (!startTime || !currentTargetRef.current) {
        cancelProgressTimer();
        return;
      }

      const elapsed = Date.now() - startTime;
      let progress = (elapsed / hoverDurationMs) * 100;

      if (progress >= 100) {
        setHoverTime(100);
        onTargetComplete(currentTargetRef.current); // 100% 달성!
        cancelProgressTimer();
      } else {
        setHoverTime(progress); // 0~100 사이 값으로 스토어 업데이트
        timerRafRef.current = requestAnimationFrame(runProgressTimer); // 다음 프레임 요청
      }
    };

    /** 2. 타겟 요소 진입 시 (Enter) */
    const onTargetEnter = (element: Element) => {
      cancelProgressTimer(); // 기존 타이머 취소
      hoverStartRef.current = Date.now(); // 3. 타이머 시작 시간 기록
      setHoverTime(0);
      timerRafRef.current = requestAnimationFrame(runProgressTimer); // 타이머 루프 시작
    };

    /** 4. 타겟 요소 이탈 시 (Leave) */
    const onTargetLeave = () => {
      cancelProgressTimer();
      setHoverTime(0); // 4. hoverTime 초기화
    };

    // --- 2. 마우스 추적 및 요소 감지 로직 (메인 루프) ---
    const tick = () => {
      rafRef.current = null;
      const pt = pointRef.current;
      if (!pt) return;

      // 커서 위치의 요소 찾기 (Shadow DOM 포함)
      let el: Element | null = document.elementFromPoint(pt.x, pt.y) || null;
      const anyEvt = window.event as any;
      const path = anyEvt?.composedPath?.() as EventTarget[] | undefined;
      if (path && path.length && path[0] instanceof Element) {
        el = path[0] as Element;
      }

      // 가장 가까운 시맨틱 부모 찾기
      const semEl = findSemanticAncestor(el);

      // --- 메인 감지/잠금 로직 ---

      // 5. 요소가 잠겨있는지 확인
      if (lockedElementRef.current) {
        if (semEl !== lockedElementRef.current) {
          // 마우스가 잠긴 요소에서 벗어남 -> 잠금 해제
          lockedElementRef.current = null;
        } else {
          // 아직 잠긴 요소 위에 있음 -> 모든 프로세스 중단
          return;
        }
      }

      // 중복 방지: 이전 프레임과 동일한 요소면 통과
      if (semEl === lastElementRef.current) return;
      lastElementRef.current = semEl; // 현재 요소를 마지막으로 기록

      // 2. 현재 요소가 타겟인지 확인
      const isMatch = isTarget(semEl, targets);
      const currentHoverEl = currentTargetRef.current;

      if (isMatch) {
        // [타겟 위]
        if (semEl !== currentHoverEl) {
          // 새로운 타겟 진입 (Enter)
          onTargetLeave(); // 이전 타겟 타이머 정리
          currentTargetRef.current = semEl; // 새 타겟 설정
          onTargetEnter(semEl!); // 새 타겟 타이머 시작
        }
        // else: 이미 타이머가 돌고 있는 동일한 타겟임 (아무것도 안 함)
      } else {
        // [타겟 밖]
        if (currentHoverEl) {
          // 타겟에서 방금 벗어남 (Leave)
          currentTargetRef.current = null;
          onTargetLeave(); // 타이머 정리
        }
        // else: 원래 타겟 밖이었음 (아무것도 안 함)
      }
    };

    // rAF 스케줄러
    const schedule = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    // 마우스 이벤트 리스너
    const onMove = (e: PointerEvent) => {
      pointRef.current = { x: e.clientX, y: e.clientY };
      schedule();
    };

    const onLeave = () => {
      // 마우스가 창을 떠남
      pointRef.current = null;
      lastElementRef.current = null;
      if (currentTargetRef.current) {
        onTargetLeave();
        currentTargetRef.current = null;
      }
      // 참고: 창을 떠나도 '잠금'은 해제되지 않습니다.
      // 다시 돌아와서 '다른' 요소로 이동해야 잠금이 풀립니다.
    };

    window.addEventListener("pointermove", onMove, { passive: true, signal });
    window.addEventListener("pointerleave", onLeave, { passive: true, signal });

    // --- 클린업 ---
    return () => {
      controller.abort(); // 모든 이벤트 리스너 제거
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      cancelProgressTimer(); // 프로그레스 타이머 제거
      setHoverTime(0); // 훅 언마운트 시 스토어 초기화
    };
    // targets 객체나 시간이 변경되면 훅을 재시작
  }, [targets, hoverDurationMs, setHoverTime]);

  // 이 훅은 값을 반환하는 대신, 이펙트와 Zustand 스토어 업데이트를 수행합니다.
}
