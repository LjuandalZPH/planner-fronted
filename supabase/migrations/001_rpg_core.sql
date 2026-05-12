create extension if not exists pgcrypto;

create or replace function public.rpg_rank_title_for_level(p_level integer)
returns text
language sql
immutable
as $$
  select case
    when greatest(1, coalesce(p_level, 1)) >= 36 then 'Mythic Sovereign / Soberano Mitico'
    when greatest(1, coalesce(p_level, 1)) >= 21 then 'Dread Knight / Caballero del Pavor'
    when greatest(1, coalesce(p_level, 1)) >= 13 then 'Shadow Blade / Hoja Sombria'
    when greatest(1, coalesce(p_level, 1)) >= 6 then 'Sellsword / Mercenario'
    else 'The Forsaken / El Abandonado'
  end;
$$;

create or replace function public.rpg_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  level integer not null default 1 check (level >= 1),
  experience integer not null default 0 check (experience >= 0),
  void_credits integer not null default 0 check (void_credits >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  last_completion_date timestamptz,
  rank_title text not null default 'The Forsaken / El Abandonado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  xp_reward integer generated always as (
    case rarity
      when 'common' then 10
      when 'rare' then 30
      when 'epic' then 70
      when 'legendary' then 150
    end
  ) stored,
  void_reward integer generated always as (
    case rarity
      when 'common' then 2
      when 'rare' then 5
      when 'epic' then 12
      when 'legendary' then 25
    end
  ) stored,
  is_sealed boolean not null default false,
  created_at timestamptz not null default now(),
  sealed_at timestamptz
);

create table if not exists public.market_relics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  cost_void integer not null check (cost_void > 0),
  icon_type text not null check (
    icon_type in (
      'scroll',
      'coffee',
      'utensils',
      'tv',
      'moon',
      'gift',
      'book_open',
      'heart',
      'gamepad_2',
      'music',
      'wine',
      'bed'
    )
  ),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contracts_profile_created_idx
  on public.contracts(profile_id, created_at desc);

create index if not exists market_relics_profile_created_idx
  on public.market_relics(profile_id, created_at desc);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.rpg_touch_updated_at();

alter table public.profiles enable row level security;
alter table public.contracts enable row level security;
alter table public.market_relics enable row level security;

drop policy if exists "profiles owned or local demo" on public.profiles;
create policy "profiles owned or local demo"
on public.profiles
for all
using (
  auth.uid() = id
  or id = '00000000-0000-4000-8000-000000000001'::uuid
)
with check (
  auth.uid() = id
  or id = '00000000-0000-4000-8000-000000000001'::uuid
);

drop policy if exists "contracts owned or local demo" on public.contracts;
create policy "contracts owned or local demo"
on public.contracts
for all
using (
  auth.uid() = profile_id
  or profile_id = '00000000-0000-4000-8000-000000000001'::uuid
)
with check (
  auth.uid() = profile_id
  or profile_id = '00000000-0000-4000-8000-000000000001'::uuid
);

drop policy if exists "market relics owned or local demo" on public.market_relics;
create policy "market relics owned or local demo"
on public.market_relics
for all
using (
  auth.uid() = profile_id
  or profile_id = '00000000-0000-4000-8000-000000000001'::uuid
)
with check (
  auth.uid() = profile_id
  or profile_id = '00000000-0000-4000-8000-000000000001'::uuid
);

create or replace function public.ensure_profile(p_profile_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  insert into public.profiles(id, rank_title)
  values (p_profile_id, public.rpg_rank_title_for_level(1))
  on conflict (id) do nothing;

  select * into v_profile
  from public.profiles
  where id = p_profile_id;

  return v_profile;
end;
$$;

create or replace function public.seal_contract_atomic(
  p_contract_id uuid,
  p_profile_id uuid,
  p_xp_multiplier numeric default 1,
  p_void_multiplier numeric default 1
)
returns table (
  contract public.contracts,
  profile public.profiles
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract public.contracts;
  v_profile public.profiles;
  v_level integer;
  v_experience integer;
  v_xp_gain integer;
  v_void_gain integer;
  v_threshold integer;
begin
  perform public.ensure_profile(p_profile_id);

  select * into v_contract
  from public.contracts
  where id = p_contract_id
    and profile_id = p_profile_id
  for update;

  if not found then
    raise exception 'contract_not_found';
  end if;

  if v_contract.is_sealed then
    raise exception 'contract_already_sealed';
  end if;

  v_xp_gain := greatest(0, floor(v_contract.xp_reward * greatest(0, coalesce(p_xp_multiplier, 1)))::integer);
  v_void_gain := greatest(0, floor(v_contract.void_reward * greatest(0, coalesce(p_void_multiplier, 1)))::integer);

  update public.contracts
  set is_sealed = true,
      sealed_at = now()
  where id = p_contract_id
  returning * into v_contract;

  select * into v_profile
  from public.profiles
  where id = p_profile_id
  for update;

  v_level := v_profile.level;
  v_experience := v_profile.experience + v_xp_gain;
  v_threshold := v_level * 100;

  while v_experience >= v_threshold loop
    v_experience := v_experience - v_threshold;
    v_level := v_level + 1;
    v_threshold := v_level * 100;
  end loop;

  update public.profiles
  set level = v_level,
      experience = v_experience,
      void_credits = v_profile.void_credits + v_void_gain,
      rank_title = public.rpg_rank_title_for_level(v_level)
  where id = p_profile_id
  returning * into v_profile;

  return query select v_contract, v_profile;
end;
$$;

create or replace function public.purchase_relic_atomic(
  p_relic_id uuid,
  p_profile_id uuid
)
returns table (
  relic public.market_relics,
  profile public.profiles
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_relic public.market_relics;
  v_profile public.profiles;
begin
  perform public.ensure_profile(p_profile_id);

  select * into v_relic
  from public.market_relics
  where id = p_relic_id
    and profile_id = p_profile_id
  for update;

  if not found then
    raise exception 'relic_not_found';
  end if;

  if v_relic.redeemed_at is not null then
    raise exception 'relic_already_redeemed';
  end if;

  select * into v_profile
  from public.profiles
  where id = p_profile_id
  for update;

  if v_profile.void_credits < v_relic.cost_void then
    raise exception 'insufficient_void_credits';
  end if;

  update public.market_relics
  set redeemed_at = now()
  where id = p_relic_id
  returning * into v_relic;

  update public.profiles
  set void_credits = void_credits - v_relic.cost_void
  where id = p_profile_id
  returning * into v_profile;

  return query select v_relic, v_profile;
end;
$$;

grant execute on function public.ensure_profile(uuid) to anon, authenticated;
grant execute on function public.seal_contract_atomic(uuid, uuid, numeric, numeric) to anon, authenticated;
grant execute on function public.purchase_relic_atomic(uuid, uuid) to anon, authenticated;
grant select, insert, update, delete on public.profiles to anon, authenticated;
grant select, insert, update, delete on public.contracts to anon, authenticated;
grant select, insert, update, delete on public.market_relics to anon, authenticated;
