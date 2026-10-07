-- Run in Supabase > SQL Editor

-- AI-generated vibe checks for restaurants
create table if not exists public.vibes (
  id bigint generated always as identity primary key,
  restaurant_id bigint not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  prompt text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.vibes enable row level security;

drop policy if exists "Anyone can read vibes" on public.vibes;
create policy "Anyone can read vibes"
  on public.vibes for select
  using (true);

drop policy if exists "Authenticated users can insert own vibes" on public.vibes;
create policy "Authenticated users can insert own vibes"
  on public.vibes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Votes on vibes (1 = upvote, -1 = downvote)
-- Only authenticated users can read votes, enforcing a sign-in wall for engagement data.
create table if not exists public.vibe_votes (
  id bigint generated always as identity primary key,
  vibe_id bigint not null references public.vibes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (1, -1)),
  created_at timestamptz not null default now(),
  unique (vibe_id, user_id)
);

alter table public.vibe_votes enable row level security;

drop policy if exists "Authenticated users can read all votes" on public.vibe_votes;
create policy "Authenticated users can read all votes"
  on public.vibe_votes for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert own votes" on public.vibe_votes;
create policy "Authenticated users can insert own votes"
  on public.vibe_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can update own votes" on public.vibe_votes;
create policy "Authenticated users can update own votes"
  on public.vibe_votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can delete own votes" on public.vibe_votes;
create policy "Authenticated users can delete own votes"
  on public.vibe_votes for delete
  to authenticated
  using (auth.uid() = user_id);
