import { useEffect, useRef } from "react";
import { useMessages } from "@/features/chat/hooks/useMessages";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { MessageInput } from "@/features/chat/components/MessageInput";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
  const { messages, isLoading } = useMessages(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru masuk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="loading" style={{ flex: 1 }}>
        <div className="spinner"></div>
        <span>Memuat pesan...</span>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state" style={{ padding: 24 }}>
            <p>Belum ada pesan. Mulai obrolan sekarang!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <MessageInput conversationId={conversationId} senderId={currentUserId} />
    </div>
  );
}
