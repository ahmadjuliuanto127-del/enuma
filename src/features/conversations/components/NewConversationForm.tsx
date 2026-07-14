import { useState, useEffect } from "react";
import { fetchAllUsers, getOrCreateConversationBetweenUsers } from "@/features/conversations/api";

interface NewConversationFormProps {
  currentUserId: string;
  onCreated: (conversationId: string) => void;
  onCancel: () => void;
}

/**
 * Modal untuk membuat percakapan baru.
 * Menampilkan daftar pengguna lain yang bisa diajak mengobrol.
 */
export function NewConversationForm({ currentUserId, onCreated, onCancel }: NewConversationFormProps) {
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchAllUsers(currentUserId)
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Gagal memuat pengguna");
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  async function handleStartChat(targetUserId: string) {
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const conversation = await getOrCreateConversationBetweenUsers(currentUserId, targetUserId);
      onCreated(conversation.id);
    } catch (err: any) {
      console.error("Error creating conversation:", err);
      setError(err?.message || "Gagal membuat percakapan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="new-conv-overlay" onClick={onCancel}>
      <div className="new-conv-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Mulai Chat Baru</h2>
          <button className="btn-ghost" onClick={onCancel} style={{ padding: "4px 8px" }}>✕</button>
        </div>

        {error && <p className="form-error">{error}</p>}

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Mencari pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: "20px 0" }}>
            <p>Belum ada pengguna lain yang terdaftar.</p>
          </div>
        ) : (
          <ul className="conv-list" style={{ maxHeight: "300px", overflowY: "auto", margin: "0 -12px" }}>
            {users.map((user) => (
              <li key={user.id}>
                <button
                  className="conv-item"
                  onClick={() => handleStartChat(user.id)}
                  disabled={isSubmitting}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px" }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--accent)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: "1.1rem"
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="conv-item-title" style={{ margin: 0 }}>{user.username}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
