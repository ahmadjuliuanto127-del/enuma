import { useConversations } from "@/features/conversations/hooks/useConversations";

interface ConversationListProps {
  onSelect: (id: string) => void;
}

export function ConversationList({ onSelect }: ConversationListProps) {
  const { conversations, isLoading, error } = useConversations();

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Memuat percakapan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">💬</span>
        <p>Belum ada percakapan. Mulai chat baru dengan menekan tombol di atas.</p>
      </div>
    );
  }

  return (
    <ul className="conv-list">
      {conversations.map((conv) => {
        const lastMsg = Array.isArray(conv.messages) ? conv.messages[0] : conv.messages;
        return (
          <li key={conv.id}>
            <button className="conv-item" onClick={() => onSelect(conv.id)}>
              <div className="conv-item-title">
                {conv.is_group ? "Grup Percakapan" : "Chat Pribadi"}
              </div>
              <div className="conv-item-preview">
                {lastMsg ? lastMsg.content || "(gambar)" : "Belum ada pesan"}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
