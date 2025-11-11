import { cdnUrl } from "@/constant/common";
import { act, renderHook } from "@testing-library/react";
import { useAgentStore } from "./agentStore";

describe("useAgentStore (Zustand)", () => {
  // 'it' (또는 'test')으로 개별 테스트 케이스를 작성합니다.
  it("초기 상태가 올바르게 설정되어야 합니다.", () => {
    // 1. renderHook을 사용해 스토어(훅)를 렌더링합니다.
    const { result } = renderHook(() => useAgentStore());

    // 2. 'expect'를 사용해 초기 상태 값을 검증합니다.
    // (setup.ts에서 초기화되지만, 여기서 한 번 더 확인하여 명확히 합니다.)
    expect(result.current.preview).toBe("");
    expect(result.current.glb).toBe("");
    expect(result.current.asleep).toBe(false);
  });

  it("setPreview 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());
    const testUrl = "path/to/preview.jpg";
    act(() => {
      result.current.setPreview(testUrl);
    });

    expect(result.current.preview).toBe(testUrl);
  });

  it("setGlb 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());
    const testUrl = `${cdnUrl}/3d/Virtualis-walking.glb`;

    act(() => {
      result.current.setGlb(testUrl);
    });

    expect(result.current.glb).toBe(testUrl);
  });

  it("setAsleep 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());

    expect(result.current.asleep).toBe(false);

    act(() => {
      result.current.setAsleep(true);
    });
    expect(result.current.asleep).toBe(true);

    act(() => {
      result.current.setAsleep(false);
    });
    expect(result.current.asleep).toBe(false);
  });
});
