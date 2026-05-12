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

alter table public.profiles enable row level security;
alter table public.contracts enable row level security;
alter table public.market_relics enable row level security;

drop policy if exists "profiles owned or local demo" on public.profiles;
drop policy if exists "contracts owned or local demo" on public.contracts;
drop policy if exists "market relics owned or local demo" on public.market_relics;

drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_delete_own"
on public.profiles
for delete
using (id = auth.uid());

drop policy if exists "contracts_insert_own" on public.contracts;
drop policy if exists "contracts_select_own" on public.contracts;
drop policy if exists "contracts_update_own" on public.contracts;
drop policy if exists "contracts_delete_own" on public.contracts;

create policy "contracts_insert_own"
on public.contracts
for insert
with check (profile_id = auth.uid());

create policy "contracts_select_own"
on public.contracts
for select
using (profile_id = auth.uid());

create policy "contracts_update_own"
on public.contracts
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "contracts_delete_own"
on public.contracts
for delete
using (profile_id = auth.uid());

drop policy if exists "market_relics_insert_own" on public.market_relics;
drop policy if exists "market_relics_select_own" on public.market_relics;
drop policy if exists "market_relics_update_own" on public.market_relics;
drop policy if exists "market_relics_delete_own" on public.market_relics;

create policy "market_relics_insert_own"
on public.market_relics
for insert
with check (profile_id = auth.uid());

create policy "market_relics_select_own"
on public.market_relics
for select
using (profile_id = auth.uid());

create policy "market_relics_update_own"
on public.market_relics
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "market_relics_delete_own"
on public.market_relics
for delete
using (profile_id = auth.uid());

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    level,
    experience,
    void_credits,
    streak_count,
    rank_title
  )
  values (
    new.id,
    1,
    0,
    0,
    0,
    public.rpg_rank_title_for_level(1)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.ensure_profile(p_profile_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is null or p_profile_id <> auth.uid() then
    raise exception 'not_authorized';
  end if;

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
  if auth.uid() is null or p_profile_id <> auth.uid() then
    raise exception 'not_authorized';
  end if;

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
    and profile_id = p_profile_id
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
  if auth.uid() is null or p_profile_id <> auth.uid() then
    raise exception 'not_authorized';
  end if;

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
    and profile_id = p_profile_id
  returning * into v_relic;

  update public.profiles
  set void_credits = void_credits - v_relic.cost_void
  where id = p_profile_id
  returning * into v_profile;

  return query select v_relic, v_profile;
end;
$$;

revoke execute on function public.ensure_profile(uuid) from anon;
revoke execute on function public.seal_contract_atomic(uuid, uuid, numeric, numeric) from anon;
revoke execute on function public.purchase_relic_atomic(uuid, uuid) from anon;
grant execute on function public.ensure_profile(uuid) to authenticated;
grant execute on function public.seal_contract_atomic(uuid, uuid, numeric, numeric) to authenticated;
grant execute on function public.purchase_relic_atomic(uuid, uuid) to authenticated;
