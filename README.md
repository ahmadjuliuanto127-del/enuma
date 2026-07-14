# Ze Chat — React + Supabase

Starter buat aplikasi chat sederhana. Realtime database dan Storage dari Supabase
sudah diintegrasikan, plus RLS policy dasar biar user cuma bisa akses percakapannya sendiri.

## Setup

1. Bikin project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan isi file `supabase/schema.sql` — ini bikin semua tabel,
   RLS policy, mengaktifkan realtime, dan bikin storage bucket `chat-images`.
3. Copy `.env.example` jadi `.env.local`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
   dari **Settings > API** di dashboard Supabase.
4. Install dependency dan jalankan:
   ```
   npm install
   npm run dev
   ```
5. (Opsional tapi disarankan) Generate ulang types dari schema asli:
   ```
   npm run gen:types
   ```
   Ini menimpa `src/types/database.types.ts` (placeholder) dengan tipe yang benar-benar
   sesuai database kamu.

## Struktur folder

```
src/
├── app/            App.tsx — komponen root
├── features/       satu folder per domain (auth, chat, profile)
│   └── <fitur>/
│       ├── components/   komponen UI khusus fitur ini
│       ├── hooks/         logic reaktif (state + subscription)
│       └── api.ts         satu-satunya tempat manggil Supabase untuk fitur ini
├── shared/          komponen/hook/lib yang dipakai lintas fitur
│   └── lib/supabaseClient.ts   satu-satunya inisialisasi Supabase client
└── types/           tipe TypeScript, termasuk database.types.ts hasil generate
```

**Aturan yang dipegang di starter ini:**
- Komponen UI tidak pernah memanggil `supabase` langsung — selalu lewat `api.ts` fitur masing-masing.
- Tiap fitur mandiri: kalau mau hapus fitur `profile`, tinggal hapus foldernya, tidak ada
  potongan kode yang nyangkut di tempat lain.
- Semua akses data dijaga RLS di level database, bukan cuma di level UI.

## Fitur Supabase yang dipakai

| Fitur | Dipakai untuk |
|---|---|
| Realtime Database | Pesan baru muncul otomatis tanpa refresh (`useMessages`) |
| Storage | Upload avatar & gambar chat (`uploadAvatar`) |
| Auth | Login/register, dan jadi basis RLS (`auth.uid()`) |

## Langkah lanjutan yang belum di-cover starter ini

- Halaman daftar percakapan (`conversations`) dan cara bikin percakapan baru
- Halaman register (baru ada `signUp` di `api.ts`, belum ada komponen form-nya)
- Read receipts / typing indicator (bisa pakai Presence dari Supabase Realtime)
- Pagination pesan lama (infinite scroll ke atas)
"# Azr-Project" 
"# enuma" 
