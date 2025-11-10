import type { SemanticHit } from "@/types/element";
import {
  classify,
  findSemanticAncestor,
  getAriaLabel,
  getRole,
} from "@/utils/semanticUtils";
import { useEffect, useRef, useState } from "react";

export function useGetElement(opts: { cooldownMs?: number } = {}): SemanticHit {
  const { cooldownMs = 1500 } = opts;

  const [hit, setHit] = useState<SemanticHit>({
    element: null,
    tagName: null,
    role: null,
    kind: null,
    ariaLabel: null,
    textSample: null,
    path: [],
    clientX: null,
    clientY: null,
  });

  const pointRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  // ✅ 같은 대상 재검출 방지용
  const lastElementRef = useRef<Element | null>(null);
  const lastFingerprintRef = useRef<string>(""); // tag|role|kind 로 구성
  // ✅ 엘리먼트별 쿨다운(메모리 누수 없는 WeakMap)
  const elementCooldownRef = useRef<WeakMap<Element, number>>(new WeakMap());

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const schedule = () => {
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      pointRef.current = { x: e.clientX, y: e.clientY };
      schedule();
    };

    const onLeave = () => {
      // 포인터가 화면 밖으로 나가면 상태/참조 초기화
      pointRef.current = null;
      lastElementRef.current = null;
      lastFingerprintRef.current = "";
      setHit((h) => ({
        ...h,
        element: null,
        tagName: null,
        role: null,
        kind: null,
      }));
    };

    window.addEventListener("pointermove", onMove, { passive: true, signal });
    window.addEventListener("pointerleave", onLeave, { passive: true, signal });

    const tick = () => {
      rafRef.current = null;
      const pt = pointRef.current;
      if (!pt) return;

      let el: Element | null = document.elementFromPoint(pt.x, pt.y) || null;

      // Shadow DOM 대응
      const anyEvt = window.event as any;
      const path = anyEvt?.composedPath?.() as EventTarget[] | undefined;
      if (path && path.length && path[0] instanceof Element) {
        el = path[0] as Element;
      }

      const sem = findSemanticAncestor(el);
      const tagName = sem?.tagName ?? null;
      const role = sem ? getRole(sem) || null : null;
      const kind = sem ? classify(sem) : null;

      // 🔒 dedupe 1: 같은 엘리먼트 + 같은 시멘틱 속성(tag/role/kind)이면 skip
      const fp = `${tagName ?? ""}|${role ?? ""}|${kind ?? ""}`;
      if (
        sem &&
        lastElementRef.current === sem &&
        lastFingerprintRef.current === fp
      ) {
        return;
      }

      if (sem) {
        const lastAt = elementCooldownRef.current.get(sem) || 0;
        const now = Date.now();
        if (now - lastAt < cooldownMs) {
          return schedule();
        }
        elementCooldownRef.current.set(sem, now);
      }

      // 무거운 계산(레이블/텍스트/경로)은 '대상 바뀐 경우에만'
      const ariaLabel = sem ? getAriaLabel(sem) : null;
      const textSample =
        sem?.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? null;

      const pathTags: string[] = [];
      let p: Element | null = el;
      for (let i = 0; i < 8 && p; i++) {
        pathTags.push(p.tagName.toLowerCase());
        p = p.parentElement;
      }

      // 상태 갱신
      setHit({
        element: sem ?? el ?? null,
        tagName,
        role,
        kind,
        ariaLabel,
        textSample,
        path: pathTags,
        clientX: pt.x,
        clientY: pt.y,
      });

      // 마지막 감지 대상/지문 저장
      lastElementRef.current = sem ?? el ?? null;
      lastFingerprintRef.current = fp;
    };

    return () => {
      controller.abort(); // ✅ 모든 이벤트 리스너 해제
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // WeakMap/refs는 GC에 맡기면 됨 (강한 참조 없음)
    };
  }, [cooldownMs]);

  return hit;
}
