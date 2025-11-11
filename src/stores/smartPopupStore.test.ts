import { act, renderHook } from "@testing-library/react";
import { useSmartPopupStore } from "./smartPopupStore";

describe("useSmartPopupStore (Zustand)", () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useSmartPopupStore.setState({
        isOpen: false,
        position: { x: 0, y: 0 },
        opacity: 1,
        isExpanded: false,
        inputValue: "",
        isPin: false,
      });
    });
  });

  it("초기 상태가 올바르게 설정되어야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.position).toEqual({ x: 0, y: 0 });
    expect(result.current.opacity).toBe(1);
    expect(result.current.isExpanded).toBe(false);
    expect(result.current.inputValue).toBe("");
    expect(result.current.isPin).toBe(false);
  });

  it("setIsOpen 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("setPosition 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());
    const newPosition = { x: 100, y: 200 };

    act(() => {
      result.current.setPosition(newPosition);
    });
    expect(result.current.position).toEqual(newPosition);

    const anotherPosition = { x: 50, y: 75 };
    act(() => {
      result.current.setPosition(anotherPosition);
    });
    expect(result.current.position).toEqual(anotherPosition);
  });

  it("setOpacity 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());

    act(() => {
      result.current.setOpacity(0.5);
    });
    expect(result.current.opacity).toBe(0.5);

    act(() => {
      result.current.setOpacity(0);
    });
    expect(result.current.opacity).toBe(0);

    act(() => {
      result.current.setOpacity(1);
    });
    expect(result.current.opacity).toBe(1);
  });

  it("setIsExpanded 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());

    act(() => {
      result.current.setIsExpanded(true);
    });
    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.setIsExpanded(false);
    });
    expect(result.current.isExpanded).toBe(false);
  });

  it("setInputValue 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());
    const testValue = "Hello, Smart Popup!";

    act(() => {
      result.current.setInputValue(testValue);
    });
    expect(result.current.inputValue).toBe(testValue);

    act(() => {
      result.current.setInputValue("");
    });
    expect(result.current.inputValue).toBe("");
  });

  it("setIsPin 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useSmartPopupStore());

    act(() => {
      result.current.setIsPin(true);
    });
    expect(result.current.isPin).toBe(true);

    act(() => {
      result.current.setIsPin(false);
    });
    expect(result.current.isPin).toBe(false);
  });
});
