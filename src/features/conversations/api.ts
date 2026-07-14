import { supabase } from "@/shared/lib/supabaseClient";

/**
 * Ambil semua conversation milik user yang sedang login.
 * RLS policy memastikan hanya conversation di mana user terdaftar
 * sebagai participant yang dikembalikan. Setiap conversation disertai
 * pesan terakhir (limit 1) untuk preview dan sorting di client.
 */
export async function fetchConversations() {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      is_group,
      created_at,
      messages(content, created_at)
    `)
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" });

  if (error) throw error;
  return data;
}

/**
 * Cari profil user berdasarkan username. Dipakai saat user mau
 * memulai percakapan baru dan memasukkan username lawan bicara.
 */
export async function findUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  if (error) throw new Error(`User "${username}" tidak ditemukan`);
  return data;
}

/**
 * Ambil semua profil pengguna lain yang tersedia untuk dihubungi.
 * Mengabaikan pengguna yang sedang login.
 */
export async function fetchAllUsers(currentUserId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username")
    .neq("id", currentUserId)
    .order("username");

  if (error) throw error;
  return data;
}

// Fallback UUID v4 generator if crypto.randomUUID is not available
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Cari conversation 1:1 yang sudah ada antara dua pengguna.
 * Kalau belum ada, buat yang baru dan tambahkan keduanya sebagai participant.
 */
export async function getOrCreateConversationBetweenUsers(
  currentUserId: string,
  targetUserId: string,
) {
  const { data: currentParticipantRows, error: currentError } = await supabase
    .from("participants")
    .select("conversation_id")
    .eq("user_id", currentUserId);

  if (currentError) throw currentError;

  const { data: targetParticipantRows, error: targetError } = await supabase
    .from("participants")
    .select("conversation_id")
    .eq("user_id", targetUserId);

  if (targetError) throw targetError;

  const currentConversationIds = new Set(
    (currentParticipantRows ?? []).map((row) => row.conversation_id),
  );

  const existingConversation = (targetParticipantRows ?? []).find((row) =>
    currentConversationIds.has(row.conversation_id),
  );

  if (existingConversation) {
    return { id: existingConversation.conversation_id, created: false };
  }

  const newConversationId = generateUUID();
  const { error } = await supabase
    .from("conversations")
    .insert({ id: newConversationId, is_group: false });

  if (error) throw error;

  const rows = [
    { conversation_id: newConversationId, user_id: currentUserId },
    { conversation_id: newConversationId, user_id: targetUserId },
  ];

  const { error: partError } = await supabase.from("participants").insert(rows);
  if (partError) throw partError;

  return { id: newConversationId, created: true };
}

/**
 * Buat conversation baru dan langsung tambahkan semua participant.
 * `is_group` otomatis true kalau participant > 2 orang.
 */
export async function createConversation(participantIds: string[]) {
  const newConversationId = generateUUID();
  const { error } = await supabase
    .from("conversations")
    .insert({ id: newConversationId, is_group: participantIds.length > 2 });
  if (error) throw error;

  const rows = participantIds.map((userId) => ({
    conversation_id: newConversationId,
    user_id: userId,
  }));
  const { error: partError } = await supabase
    .from("participants")
    .insert(rows);
  if (partError) throw partError;

  return { id: newConversationId };
}
