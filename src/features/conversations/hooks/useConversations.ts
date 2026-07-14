import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabaseClient";
import { fetchConversations } from "@/features/conversations/api";

type ConversationRow = Awaited<ReturnType<typeof fetchConversations>>[number];

/**
 * Ambil daftar conversation milik user, urutkan berdasarkan pesan terakhir.
 * Conversation tanpa pesan di-fallback ke `created_at` conversation.
 * Menyediakan `refresh()` untuk memuat ulang tanpa unmount komponen.
 */
export function useConversations() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);

    fetchConversations()
      .then((data) => {
        const sorted = [...data].sort((a, b) => {
          const lastA = Array.isArray(a.messages) ? a.messages[0] : a.messages;
          const lastB = Array.isArray(b.messages) ? b.messages[0] : b.messages;
          const timeA = lastA?.created_at ?? a.created_at;
          const timeB = lastB?.created_at ?? b.created_at;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
        setConversations(sorted);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat percakapan");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("conversations:updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return { conversations, isLoading, error, refresh: load };
}
