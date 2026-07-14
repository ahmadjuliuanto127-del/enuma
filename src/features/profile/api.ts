import { supabase } from "@/shared/lib/supabaseClient";

// File disimpan di path `{userId}/{namaFile}` supaya cocok dengan RLS policy storage
// yang ngecek folder pertama = auth.uid() (lihat supabase/schema.sql).
export async function uploadAvatar(userId: string, file: File) {
  const filePath = `${userId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("chat-images")
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", userId);
  if (updateError) throw updateError;

  return data.publicUrl;
}
