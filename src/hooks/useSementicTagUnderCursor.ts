// useSemanticElementUnderCursor.ts
import { useEffect, useRef, useState } from "react";

type SemanticKind =
  | "landmark"
  | "interactive"
  | "sectioning"
  | "text"
  | "other";

export type SemanticHit = {
  element: Element | null;
  tagName: string | null;
  role: string | null;
  kind: SemanticKind | null;
  ariaLabel: string | null;
  textSample: string | null;
  path: string[];
  clientX: number | null;
  clientY: number | null;
};

const LANDMARK_TAGS = new Set(["HEADER", "FOOTER", "NAV", "MAIN", "ASIDE"]);
const LANDMARK_ROLES = new Set([
  "banner",
  "navigation",
  "main",
  "contentinfo",
  "complementary",
  "region",
  "search",
]);
const INTERACTIVE_TAGS = new Set([
  "A",
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "SUMMARY",
  "LABEL",
  "DETAILS",
]);
const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "checkbox",
  "radio",
  "switch",
  "slider",
  "tab",
  "menuitem",
  "menuitemradio",
  "menuitemcheckbox",
  "option",
  "combobox",
  "listbox",
  "textbox",
  "spinbutton",
  "searchbox",
]);
const SECTIONING_TAGS = new Set(["SECTION", "ARTICLE", "FIGURE", "FIGCAPTION"]);

// ===== helpers =====
function getRole(el: Element): string | null {
  const role = el.getAttribute?.("role");
  return role ? role.trim() : null;
}
function getAriaLabel(el: Element): string | null {
  const label = el.getAttribute?.("aria-label");
  if (label) return label.trim() || null;
  const labelledBy = el.getAttribute?.("aria-labelledby");
  if (labelledBy) {
    const id = labelledBy.trim();
    const target = id && document.getElementById(id);
    if (target) return target.textContent?.trim() || null;
  }
  const tn = el.tagName;
  if (tn === "A" || tn === "BUTTON" || tn === "SUMMARY" || tn === "LABEL") {
    const txt = el.textContent?.trim();
    if (txt) return txt.slice(0, 80);
  }
  return null;
}
function classify(el: Element): SemanticKind {
  const tag = el.tagName;
  const role = (getRole(el) || "").toLowerCase();
  if (LANDMARK_TAGS.has(tag) || LANDMARK_ROLES.has(role)) return "landmark";
  if (INTERACTIVE_TAGS.has(tag) || INTERACTIVE_ROLES.has(role))
    return "interactive";
  if (SECTIONING_TAGS.has(tag)) return "sectioning";
  if (/^H[1-6]$/.test(tag) || tag === "P") return "text";
  return "other";
}
function findSemanticAncestor(node: Element | null): Element | null {
  let el: Element | null = node;
  while (el) {
    const kind = classify(el);
    const role = (getRole(el) || "").toLowerCase();
    if (
      kind !== "other" ||
      LANDMARK_ROLES.has(role) ||
      INTERACTIVE_ROLES.has(role)
    )
      return el;
    el = el.parentElement;
  }
  return null;
}

// ===== Hook =====
export function useSementicTagUnderCursor(
  opts: { cooldownMs?: number } = {}
): SemanticHit {
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
        // 좌표만 바뀌는 경우엔 굳이 재계산/문자열 생성 X → 가벼운 좌표만 갱신하고 끝내려면 아래 주석 해제
        // setHit((prev) => (prev.element ? { ...prev, clientX: pt.x, clientY: pt.y } : prev));
        return;
      }

      // 🔒 dedupe 2: 엘리먼트별 쿨다운
      if (sem) {
        const lastAt = elementCooldownRef.current.get(sem) || 0;
        const now = Date.now();
        if (now - lastAt < cooldownMs) {
          // 쿨다운 중이면 좌표만 갱신(선택)
          // setHit((prev) => (prev.element === sem ? { ...prev, clientX: pt.x, clientY: pt.y } : prev));
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
