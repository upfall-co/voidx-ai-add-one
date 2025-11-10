export type SemanticKind =
  | "landmark"
  | "interactive"
  | "sectioning"
  | "text"
  | "other";

export type ElementTarget = {
  semanticTag?: string; // HTML 태그 이름 (예: "MAIN", "BUTTON")
  className?: string; // CSS 클래스 이름
  id?: string; // HTML ID
};

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
