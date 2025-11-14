import { cdnUrl } from "@/constant/common";
import { useHoverDetector, type HoverTargets } from "@/hooks/useHoverDetector";
import { useAgentStore } from "@/stores/agentStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { useEffect, useMemo } from "react";
import CursorAgent from "./agent/CursorAgent";
import DonutGauge from "./agent/DonutGauge";
import Chatbot from "./chatbot/Chatbot";
import SmartNudgePopup from "./popup/SmartNudgePopup";

/** index html 기준 목업된 타겟
 * 추후 API로부터 리스트 전달받아서 HoverTargets 형태로 전처리
 */

// const MY_TARGETS: HoverTargets = {
//   ids: [],
//   classNames: ["product-item"],
// };

const MY_TARGETS: HoverTargets = {
  /**
   * 정확히 일치하는 클래스명
   * - "product-item": 이전 HTML 템플릿 및 예시에서 사용된 기본 상품 카드 클래스
   * - "e-product-card": [data-product JSON 추출].css_selector에서 발견된 상품 카드 클래스
   */
  classNames: ["product-item", "e-product-card"],

  /**
   * 정확히 일치하는 ID (일반적으로 상품 ID는 동적이므로 패턴을 사용)
   */
  ids: [],

  /**
   * ID 정규식 패턴
   * - [상품 ID 추출].id_pattern에서 가져옴
   */
  idPatterns: [
    /^product-[A-Za-z0-9]+$/, // r'^product-[A-Za-z0-9]+$'
    /product-\w+/, // r'product-\w+'
  ],

  /**
   * 클래스명 정규식 패턴
   * (상품명, 가격 등 자식 요소의 클래스 패턴은 제외)
   */
  classNamePatterns: [],
};

export default function VoidxProvider() {
  const setGlb = useAgentStore((s) => s.setGlb);
  const addMessage = useMessageStore((s) => s.addMessage);
  const chatIsOpen = useChatbotStore((s) => s.isOpen);

  const targets = useMemo(() => MY_TARGETS, []);
  const findEl = useHoverDetector(targets, 1500);

  useEffect(() => {
    if (findEl) {
      addMessage({
        type: chatIsOpen ? "chat" : "nudge",
        role: "bot",
        content: findEl.outerHTML,
      });
    }
  }, [findEl]);

  useEffect(() => {
    setGlb(`${cdnUrl}/3d/Virtualis-walking.glb`);
  }, [setGlb]);

  return (
    <>
      <SmartNudgePopup />
      <Chatbot />
      <CursorAgent />
      <DonutGauge />
    </>
  );
}
