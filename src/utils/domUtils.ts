/**
 * prop으로 전달받은 클래스의 엘리먼트 리스트를 반환합니다.
 * @param className 찾을 CSS 클래스 이름 (예: "my-component")
 * @returns Element[]
 */
export function searchClass(className: string): Element[] {
  if (!className) return [];
  // CSS 클래스 선택자를 사용하여 쿼리합니다.
  return Array.from(document.querySelectorAll(`.${className}`));
}

/**
 * prop으로 전달받은 아이디의 엘리먼트를 반환합니다.
 * @param id 찾을 HTML ID (예: "main-content")
 * @returns Element | null
 */
export function searchId(id: string): Element | null {
  if (!id) return null;
  return document.getElementById(id);
}
