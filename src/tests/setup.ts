// src/tests/setup.ts

import { cdnUrl } from "@/constant/common";
import { useChatbotStore } from "@/stores/chatbotStore";
import "@testing-library/jest-dom";
import { useAgentStore } from "../stores/agentStore"; // 1. 테스트할 스토어 임포트

// 2. Zustand 스토어의 상태를 초기값으로 리셋
beforeEach(() => {
  useAgentStore.setState({
    preview: "",
    glb: "",
    asleep: false,
  });
  useChatbotStore.setState({
    isOpen: false,
    opacity: 1,
    arkPreview: `${cdnUrl}/icons/3d_1button-icon-SVG.svg`,
    arkGlb: `${cdnUrl}/3d/ark_model_00.glb`,
    mode: "sleeping",
    input: "",
  });
});
