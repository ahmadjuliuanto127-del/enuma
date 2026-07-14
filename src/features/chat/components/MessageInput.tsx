import { useState } from "react";
import { sendMessage } from "@/features/chat/api";

interface MessageInputProps {
  conversationId: string;
  senderId: string;
}

export function MessageInput({ conversationId, senderId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(conversationId, senderId, content.trim());
      setContent("");
    } catch (err) {
      console.error("Gagal mengirim pesan:", err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="chat-input-area" onSubmit={handleSend}>
      <input
        className="input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tulis pesan..."
        disabled={isSending}
        required
      />
      <button className="btn btn-primary" type="submit" disabled={isSending || !content.trim()}>
        {isSending ? "Kirim..." : "Kirim"}
      </button>
    </form>
  );
}
