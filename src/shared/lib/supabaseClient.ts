import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Jangan crash saat import — beri peringatan agar UI bisa render untuk debugging.
  // Pengguna tetap harus menyalin .env.example ke .env.local untuk koneksi nyata.
  console.warn(
    "Supabase env vars belum diset. Salin .env.example jadi .env.local dan isi nilainya.",
  );
}

// Client bertipe otomatis dari schema database (lihat src/types/database.types.ts).
// Komponen UI TIDAK BOLEH memanggil createClient sendiri — selalu import dari sini,
// supaya cuma ada satu instance dan satu titik untuk ganti konfigurasi.
export const supabase = createClient<Database>(supabaseUrl as string, supabaseAnonKey as string);
