-- ============================================================
-- SCHEMA: chat app starter
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Profiles: 1:1 dengan auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Participants: siapa aja yang ada di satu percakapan
create table participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (conversation_id, user_id)
);

-- 4. Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on messages(conversation_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- Prinsip: user hanya boleh baca/tulis data di percakapan
-- dia sendiri jadi peserta (participants).
-- ============================================================

alter table profiles enable row level security;
alter table conversations enable row level security;
alter table participants enable row level security;
alter table messages enable row level security;

-- Profiles: semua orang login boleh liat profil dasar (buat nampilin nama/avatar di chat),
-- tapi cuma pemilik yang boleh update.
create policy "profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- FUNCTION UNTUK MENCEGAH INFINITE RECURSION RLS
-- ============================================================
create or replace function is_participant_in_conversation(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from participants
    where conversation_id = conv_id
    and user_id = auth.uid()
  );
$$;

-- Conversations: cuma peserta yang boleh liat percakapannya
create policy "participants can view their conversations"
  on conversations for select
  using (is_participant_in_conversation(id));

create policy "authenticated users can create conversations"
  on conversations for insert
  with check (auth.role() = 'authenticated');

-- Participants: cuma peserta yang boleh liat daftar peserta lain di conversation yang sama
create policy "participants can view participant list"
  on participants for select
  using (is_participant_in_conversation(conversation_id));

-- Messages: cuma peserta yang boleh baca & kirim pesan di conversation itu
create policy "participants can view messages"
  on messages for select
  using (is_participant_in_conversation(conversation_id));

create policy "participants can send messages"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and is_participant_in_conversation(conversation_id)
  );

-- ============================================================
-- REALTIME
-- Aktifkan replication buat tabel messages, biar insert baru
-- langsung ke-push ke client yang subscribe.
-- ============================================================
alter publication supabase_realtime add table messages;

-- ============================================================
-- STORAGE
-- Bucket buat avatar & gambar chat. Jalankan lewat SQL editor
-- atau bikin manual di Dashboard > Storage.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', true)
on conflict (id) do nothing;

-- Semua orang login boleh upload ke folder dengan nama = user id mereka sendiri
create policy "users can upload their own chat images"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "chat images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'chat-images');

-- ============================================================
-- POLICY TAMBAHAN
-- Insert policy untuk participants dan profiles, supaya
-- createConversation dan signUp bisa jalan lewat client SDK.
-- ============================================================

-- User bisa insert profil untuk dirinya sendiri (dipanggil saat register)
create policy "users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Authenticated user bisa menambahkan peserta ke conversation
create policy "authenticated users can add participants"
  on participants for insert
  with check (auth.role() = 'authenticated');

