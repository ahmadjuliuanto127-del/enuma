import { useState } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { ConversationList } from "@/features/conversations/components/ConversationList";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { NewConversationForm } from "@/features/conversations/components/NewConversationForm";
import { signOut } from "@/features/auth/api";

export function App() {
  const { session, isLoading } = useSession();
  const [isRegister, setIsRegister] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);

  if (isLoading) {
    return (
      <div className="loading" style={{ height: "100vh" }}>
        <div className="spinner"></div>
        <span>Memuat...</span>
      </div>
    );
  }

  // Halaman Auth (Login / Register)
  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <span className="app-title">Ze Chat</span>
          <p className="auth-subtitle">Masuk atau daftarkan akun baru Anda</p>
          {isRegister ? <RegisterForm /> : <LoginForm />}
          <div className="auth-toggle">
            <button className="btn-link" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        {/* Header App */}
        <header className="app-header">
          <span className="app-title">Ze Chat</span>
          <div className="conv-header-actions">
            {!conversationId && (
              <button className="btn btn-primary" onClick={() => setShowNewConv(true)}>
                + Chat Baru
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => signOut()}>
              Keluar
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {conversationId ? (
            <div className="chat-container">
              <div className="chat-header">
                <button className="btn btn-ghost" onClick={() => setConversationId(null)} style={{ padding: "8px 12px" }}>
                  ← Kembali
                </button>
                <span className="chat-header-title">Percakapan</span>
              </div>
              <ChatWindow conversationId={conversationId} currentUserId={session.user.id} />
            </div>
          ) : (
            <ConversationList onSelect={setConversationId} />
          )}
        </main>

        {/* Modal Percakapan Baru */}
        {showNewConv && (
          <NewConversationForm
            currentUserId={session.user.id}
            onCreated={(id) => {
              setConversationId(id);
              setShowNewConv(false);
            }}
            onCancel={() => setShowNewConv(false)}
          />
        )}
      </div>
    </div>
  );
}
