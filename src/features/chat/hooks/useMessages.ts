import { useEffect, useState } from "react";
import { supabase } from "@/shared/lib/supabaseClient";
import { fetchMessages } from "@/features/chat/api";
import type { Database } from "@/types/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

// Hook ini yang jadi jantung fitur realtime-nya:
// 1. Ambil histori pesan sekali di awal.
// 2. Subscribe ke channel Postgres Changes buat conversation ini.
// 3. Tiap ada insert baru, langsung ditambahin ke state tanpa refetch.
export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchMessages(conversationId).then((data) => {
      if (isMounted) {
        setMessages(data);
        setIsLoading(false);
      }
    });

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incomingMessage = payload.new as Message;
          setMessages((current) => {
            if (current.some((message) => message.id === incomingMessage.id)) {
              return current;
            }
            return [...current, incomingMessage];
          });
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, isLoading };
}
