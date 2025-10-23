import type { MessageRole } from '@/stores/voidxAgentStore';
import clsx from "clsx";

export default function MessageBubble({
  role,
  children,
}: {
  role: MessageRole;
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  const commonClass =
    "my-1 flex max-w-[70%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed";
  const userClass =
    "bg-black/90 text-white self-end rounded-lg rounded-br-none";
  const botClass =
    "bg-white/45 text-black self-start rounded-lg rounded-bl-none";
  return (
    <div
      className={clsx(commonClass, {
        [userClass]: isUser,
        [botClass]: !isUser,
      })}
      dangerouslySetInnerHTML={{ __html: children as string }}
    />
  );
}
