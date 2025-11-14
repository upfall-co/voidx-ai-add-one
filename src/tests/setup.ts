import "react-dom/test-utils";

import { cdnUrl } from "@/constant/common";
import { useChatbotStore } from "@/stores/chatbotStore";
import * as matchers from "@testing-library/jest-dom/matchers";
import { beforeEach, expect } from "vitest";

expect.extend(matchers);

import { useAgentStore } from "../stores/agentStore";

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
