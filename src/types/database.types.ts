// File ini idealnya di-generate otomatis, jangan diedit manual.
// Jalankan setelah schema.sql di-apply ke project Supabase kamu:
//
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
//
// Di bawah ini placeholder minimal supaya project tetap type-check
// sebelum kamu generate versi aslinya.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          is_group: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          is_group?: boolean;
        };
        Update: {
          is_group?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["conversation_id"];
          },
        ];
      };
      participants: {
        Row: {
          conversation_id: string;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          image_url?: string | null;
        };
        Update: {
          content?: string | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
