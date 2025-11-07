import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import MessageBubble from '../popup/MessageBubble';

const chatListVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: "0%", opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

export default function ChattingList() {
  const messages = useMessageStore((s) => s.messages);
  const opacity = useChatbotStore((s) => s.opacity);
  const mode = useChatbotStore((s) => s.mode);

  const chattingBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chattingBodyRef.current) {
      chattingBodyRef.current.scrollTop = chattingBodyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {mode === "chatting" && (
        <motion.div
          key="chatting-list"
          variants={chatListVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 z-10 w-full h-full "
        >
          <div className="absolute top-0 w-full h-full mb-24">
            <div
              ref={chattingBodyRef}
              className="flex flex-col h-full gap-3 p-4 overflow-y-auto"
              style={{ opacity }}
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role}>
                  {msg.content}
                </MessageBubble>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
