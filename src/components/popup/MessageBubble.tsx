import clsx from "clsx";

export type MessageRole = "user" | "bot";
export type ContentType = "message" | "product";

export default function MessageBubble({
  role,
  children,
  contentType,
}: {
  role: MessageRole;
  children: React.ReactNode;
  contentType?: ContentType;
}) {
  const isUser = role === "user";
  const commonClass =
    "my-1 flex max-w-[70%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed";
  const userClass =
    "bg-black/90 text-white self-end rounded-lg rounded-br-none";
  const botClass =
    "bg-white/45 text-black self-start rounded-lg rounded-bl-none";

  if (contentType && contentType === "product") {
    return (
      <div
        className="text-sm"
        dangerouslySetInnerHTML={{
          __html: children as string,
        }}
      />
    );
  }
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
