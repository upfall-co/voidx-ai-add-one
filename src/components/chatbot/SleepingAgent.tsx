import { useRef } from "react";
import type { Group } from "three";
import { GhostScene } from "../agent/CursorAgentModel";

export type AgentHandle = {
  jumpTwice: () => Promise<void>;
};

export type SleepingAgentModelProps = {
  url: string;
};

const SleepingAgentModel = ({ url }: { url: string }) => {
  const agentRef = useRef<Group>(null!);

  return (
    <group
      ref={agentRef}
      position={[0, 0, 0.4]}
      rotation={[-0.4, 0.8, 0.3]}
      scale={0.2}
      castShadow={true}
    >
      <GhostScene url={url} />
    </group>
  );
};

export default SleepingAgentModel;
