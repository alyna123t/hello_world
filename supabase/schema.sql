-- Run this in Supabase > SQL Editor.
create table if not exists public.restaurants (
  id bigint generated always as identity primary key,
  name text not null,
  neighbourhood text not null,
  cuisine text not null,
  price_range text not null,
  created_at timestamptz not null default now()
);

-- Allow anyone with the anon key to read rows (required for the list page).
alter table public.restaurants enable row level security;

drop policy if exists "Public read access" on public.restaurants;
create policy "Public read access"
  on public.restaurants for select
  to anon
  using (true);

insert into public.restaurants (name, neighbourhood, cuisine, price_range) values
  ('Joe''s Pizza', 'Greenwich Village', 'Pizza', '$'),
  ('Katz''s Delicatessen', 'Lower East Side', 'Deli', '$$'),
  ('Xi''an Famous Foods', 'Chinatown', 'Chinese', '$'),
  ('Los Tacos No. 1', 'Chelsea', 'Mexican', '$'),
  ('Peter Luger Steak House', 'Williamsburg', 'Steakhouse', '$$$$'),
  ('Via Carota', 'West Village', 'Italian', '$$$'),
  ('Cote', 'Flatiron', 'Korean BBQ', '$$$$'),
  ('Superiority Burger', 'East Village', 'Vegetarian', '$$');
