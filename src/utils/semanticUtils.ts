import type { SemanticKind } from "@/types/element";

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

const SECTIONING_TAGS = new Set([
  "SECTION",
  "ARTICLE",
  "FIGURE",
  "FIGCAPTION",
  "IMG",
]);

// ===== 헬퍼 함수 (재사용 가능) =====
export function getRole(el: Element): string | null {
  const role = el.getAttribute?.("role");
  return role ? role.trim() : null;
}

export function getAriaLabel(el: Element): string | null {
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

export function classify(el: Element): SemanticKind {
  const tag = el.tagName;
  const role = (getRole(el) || "").toLowerCase();
  if (LANDMARK_TAGS.has(tag) || LANDMARK_ROLES.has(role)) return "landmark";
  if (INTERACTIVE_TAGS.has(tag) || INTERACTIVE_ROLES.has(role))
    return "interactive";
  if (SECTIONING_TAGS.has(tag)) return "sectioning";
  if (/^H[1-6]$/.test(tag) || tag === "P") return "text";
  return "other";
}

/**
 * 주어진 노드의 가장 가까운 시맨틱 부모 요소를 찾습니다.
 */
export function findSemanticAncestor(node: Element | null): Element | null {
  let el: Element | null = node;
  while (el) {
    const kind = classify(el);
    const role = (getRole(el) || "").toLowerCase();
    // 'other'가 아니거나, 주요 ARIA role을 가진 경우 시맨틱 요소로 간주
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

/**
 * prop으로 전달받은 시멘틱 태그(tagName)의 엘리먼트를 반환합니다.
 * @param tagName 찾을 시맨틱 HTML 태그 이름 (예: "HEADER", "MAIN", "BUTTON")
 * @returns Element | null
 */
export function searchSemanticTag(tagName: string): Element | null {
  if (!tagName) return null;
  const tag = tagName.toUpperCase();
  // 시맨틱 태그 목록에 있는지 확인하여 불필요한 쿼리 방지
  if (
    LANDMARK_TAGS.has(tag) ||
    INTERACTIVE_TAGS.has(tag) ||
    SECTIONING_TAGS.has(tag) ||
    /^H[1-6]$/.test(tag) ||
    tag === "P"
  ) {
    return document.querySelector(tag) ?? null;
  }
  return null;
}
