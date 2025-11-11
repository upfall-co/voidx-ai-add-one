import { create } from "zustand";

type InteractionState = {
  level: number;
  hoverTime: number;
};

type InteractionActions = {
  setLevel: (level: number | ((prevLevel: number) => number)) => void;
  setHoverTime: (
    hoverTime: number | ((prevHoverTime: number) => number)
  ) => void;
};

export const useInteractionStore = create<
  InteractionState & InteractionActions
>((set, get) => ({
  level: 1,
  hoverTime: 0,

  setLevel: (newLevel) => {
    const updatedLevel =
      typeof newLevel === "function" ? newLevel(get().level) : newLevel;

    const cappedLevel = updatedLevel > 5 ? 5 : updatedLevel;

    if (cappedLevel === get().level) return;

    set({
      level: cappedLevel,
    });
  },
  setHoverTime: (hoverTime) => {
    const newHoverTime =
      typeof hoverTime === "function" ? hoverTime(get().hoverTime) : hoverTime;
    set({
      hoverTime: newHoverTime,
    });
  },
}));
