import type { Database } from "@/types/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Format waktu pesan sederhana (HH:MM)
  const timeString = new Date(message.created_at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message ${isOwn ? "message-own" : "message-other"}`}>
      <div className="message-bubble">
        {message.image_url && (
          <img src={message.image_url} alt="Image upload" className="message-image" />
        )}
        {message.content && <p>{message.content}</p>}
      </div>
      <div className="message-time">{timeString}</div>
    </div>
  );
}
