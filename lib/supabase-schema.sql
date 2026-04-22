-- Run this in Supabase SQL Editor

-- Users profile table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  year_of_birth integer,
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  goal text check (goal in ('lose','maintain','gain')),
  goal_speed text check (goal_speed in ('slow','medium','fast')),
  exercise_days_per_week integer default 3,
  heard_from text,
  tried_tracking_before boolean default false,
  daily_calorie_goal integer default 2000,
  daily_protein_goal integer default 150,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- Meals table
create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  meal_type text check (meal_type in ('breakfast','lunch','dinner','snacks')) not null,
  food_name text not null,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  amount text,
  source text,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.meals enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own meals" on public.meals
  for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own meals" on public.meals
  for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
