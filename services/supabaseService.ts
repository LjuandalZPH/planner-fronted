import { supabase, isLocalFallback } from "@/lib/supabaseClient";
import {
  RARITY_VOID_CREDITS_BASE,
  getRankForLevel,
  getXpForRarity,
  missionCreateFormSchema,
  type MissionCreateFormInput,
  type MissionRarity,
} from "@/lib/gamification";
import {
  blackMarketItemCreateSchema,
  type BlackMarketItemCreateInput,
} from "@/types/black-market";
import type {
  DbContract,
  DbMarketRelic,
  DbProfile,
  RpgContract,
  RpgMarketRelic,
  RpgProfile,
  ServiceResult,
} from "@/types/supabase";

export const LOCAL_PROFILE_ID = "00000000-0000-4000-8000-000000000001";

const STORAGE_PROFILE = "planner_profile_v1";
const STORAGE_CONTRACTS = "planner_contracts_v1";
const STORAGE_RELICS = "planner_market_relics_v1";

let localProfileScope = LOCAL_PROFILE_ID;

interface SealTaskOptions {
  xpMultiplier?: number;
  voidMultiplier?: number;
}

type ProfilePatch = Partial<
  Pick<
    RpgProfile,
    "level" | "experience" | "voidCredits" | "streakCount" | "lastCompletionDate" | "rankTitle"
  >
>;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function setServiceUserScope(userId: string | null): void {
  localProfileScope = userId || LOCAL_PROFILE_ID;
}

function storageKey(base: string): string {
  return `${base}:${localProfileScope}`;
}

function readLocal<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    /* localStorage can be unavailable or full during demos. */
  }
}

function safeInt(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

function rankTitleForLevel(level: number): string {
  const rank = getRankForLevel(level);
  return `${rank.titleEn} / ${rank.titleEs}`;
}

function defaultProfile(): RpgProfile {
  return {
    id: localProfileScope,
    level: 1,
    experience: 0,
    voidCredits: 0,
    streakCount: 0,
    lastCompletionDate: null,
    rankTitle: rankTitleForLevel(1),
  };
}

function mapProfile(row: DbProfile): RpgProfile {
  return {
    id: row.id,
    level: safeInt(row.level, 1) || 1,
    experience: safeInt(row.experience),
    voidCredits: safeInt(row.void_credits),
    streakCount: safeInt(row.streak_count),
    lastCompletionDate: row.last_completion_date ?? null,
    rankTitle: row.rank_title || rankTitleForLevel(row.level),
  };
}

function profilePatchToDb(patch: ProfilePatch): Partial<DbProfile> {
  const out: Partial<DbProfile> = {};
  if (patch.level !== undefined) out.level = safeInt(patch.level, 1) || 1;
  if (patch.experience !== undefined) out.experience = safeInt(patch.experience);
  if (patch.voidCredits !== undefined) out.void_credits = safeInt(patch.voidCredits);
  if (patch.streakCount !== undefined) out.streak_count = safeInt(patch.streakCount);
  if (patch.lastCompletionDate !== undefined) out.last_completion_date = patch.lastCompletionDate;
  if (patch.rankTitle !== undefined) out.rank_title = patch.rankTitle;
  return out;
}

function readLocalProfile(): RpgProfile {
  return readLocal<RpgProfile>(STORAGE_PROFILE, defaultProfile());
}

function writeLocalProfile(profile: RpgProfile): RpgProfile {
  const normalized = {
    ...profile,
    level: Math.max(1, safeInt(profile.level, 1)),
    experience: safeInt(profile.experience),
    voidCredits: safeInt(profile.voidCredits),
    streakCount: safeInt(profile.streakCount),
    rankTitle: profile.rankTitle || rankTitleForLevel(profile.level),
  };
  writeLocal(STORAGE_PROFILE, normalized);
  return normalized;
}

function mapContract(row: DbContract): RpgContract {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    rarity: row.rarity,
    progress: row.is_sealed ? 100 : 0,
    xpReward: safeInt(row.xp_reward),
    voidReward: safeInt(row.void_reward),
    isSealed: row.is_sealed,
    createdAt: row.created_at,
    sealedAt: row.sealed_at ?? null,
  };
}

function createLocalContract(input: MissionCreateFormInput, id = crypto.randomUUID()): RpgContract {
  const now = new Date().toISOString();
  return {
    id,
    title: input.title,
    description: input.description,
    rarity: input.rarity,
    progress: 0,
    xpReward: getXpForRarity(input.rarity),
    voidReward: RARITY_VOID_CREDITS_BASE[input.rarity],
    isSealed: false,
    createdAt: now,
    sealedAt: null,
  };
}

function readLocalContracts(): RpgContract[] {
  return readLocal<RpgContract[]>(STORAGE_CONTRACTS, []);
}

function writeLocalContracts(contracts: RpgContract[]): RpgContract[] {
  writeLocal(STORAGE_CONTRACTS, contracts);
  return contracts;
}

function mapRelic(row: DbMarketRelic): RpgMarketRelic {
  return {
    id: row.id,
    name: row.title,
    costCredits: safeInt(row.cost_void),
    iconId: row.icon_type,
    source: "user",
    redeemedAt: row.redeemed_at ?? null,
  };
}

function createLocalRelic(input: BlackMarketItemCreateInput, id = crypto.randomUUID()): RpgMarketRelic {
  return {
    id,
    name: input.name,
    costCredits: input.costCredits,
    iconId: input.iconId,
    source: "user",
    redeemedAt: null,
  };
}

function readLocalRelics(): RpgMarketRelic[] {
  return readLocal<RpgMarketRelic[]>(STORAGE_RELICS, []);
}

function writeLocalRelics(relics: RpgMarketRelic[]): RpgMarketRelic[] {
  writeLocal(STORAGE_RELICS, relics);
  return relics;
}

function applyXp(profile: RpgProfile, xpGain: number, voidGain = 0): RpgProfile {
  let level = Math.max(1, safeInt(profile.level, 1));
  let experience = safeInt(profile.experience) + safeInt(xpGain);
  let threshold = level * 100;

  while (experience >= threshold) {
    experience -= threshold;
    level += 1;
    threshold = level * 100;
  }

  return writeLocalProfile({
    ...profile,
    level,
    experience,
    voidCredits: safeInt(profile.voidCredits) + safeInt(voidGain),
    rankTitle: rankTitleForLevel(level),
  });
}

async function getProfileId(): Promise<string> {
  if (!supabase || isLocalFallback) return localProfileScope;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    if (!userId) throw new Error("Authentication required");
    setServiceUserScope(userId);
    return userId;
  } catch (error) {
    throw error instanceof Error ? error : new Error("Authentication required");
  }
}

function localResult<T>(data: T): ServiceResult<T> {
  return { success: true, data, source: "local" };
}

function localError<T>(error: string): ServiceResult<T> {
  return { success: false, error, source: "local" };
}

export async function fetchProfile(): Promise<ServiceResult<RpgProfile>> {
  const local = readLocalProfile();
  if (!supabase || isLocalFallback) return localResult(local);

  try {
    const profileId = await getProfileId();
    const { data, error } = await supabase.rpc("ensure_profile", {
      p_profile_id: profileId,
    });
    if (error || !data) throw error ?? new Error("Profile not found");

    const profile = writeLocalProfile(mapProfile(data as DbProfile));
    return { success: true, data: profile, source: "supabase" };
  } catch (error) {
    return { success: true, data: local, error: errorMessage(error), source: "local" };
  }
}

export async function updateProfile(patch: ProfilePatch): Promise<ServiceResult<RpgProfile>> {
  const previous = readLocalProfile();
  const next = writeLocalProfile({
    ...previous,
    ...patch,
    rankTitle: patch.rankTitle ?? rankTitleForLevel(patch.level ?? previous.level),
  });

  if (!supabase || isLocalFallback) return localResult(next);

  try {
    const profileId = await getProfileId();
    await supabase.rpc("ensure_profile", { p_profile_id: profileId });
    const { data, error } = await supabase
      .from("profiles")
      .update(profilePatchToDb(next))
      .eq("id", profileId)
      .select("*")
      .single();
    if (error || !data) throw error ?? new Error("Profile update failed");

    const saved = writeLocalProfile(mapProfile(data as DbProfile));
    return { success: true, data: saved, source: "supabase" };
  } catch (error) {
    return { success: true, data: next, error: errorMessage(error), source: "local" };
  }
}

export async function fetchTasks(): Promise<ServiceResult<RpgContract[]>> {
  const local = readLocalContracts();
  if (!supabase || isLocalFallback) return localResult(local);

  try {
    const profileId = await getProfileId();
    await supabase.rpc("ensure_profile", { p_profile_id: profileId });
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error || !data) throw error ?? new Error("Contracts fetch failed");

    const contracts = writeLocalContracts((data as DbContract[]).map(mapContract));
    return { success: true, data: contracts, source: "supabase" };
  } catch (error) {
    return { success: true, data: local, error: errorMessage(error), source: "local" };
  }
}

export async function createTask(
  input: MissionCreateFormInput,
  options: { id?: string } = {},
): Promise<ServiceResult<RpgContract>> {
  const parsed = missionCreateFormSchema.safeParse(input);
  if (!parsed.success) {
    return localError(parsed.error.issues[0]?.message ?? "Invalid contract");
  }

  const optimistic = createLocalContract(parsed.data, options.id);
  const local = writeLocalContracts([optimistic, ...readLocalContracts().filter((c) => c.id !== optimistic.id)]);

  if (!supabase || isLocalFallback) return localResult(local[0]);

  try {
    const profileId = await getProfileId();
    await supabase.rpc("ensure_profile", { p_profile_id: profileId });
    const { data, error } = await supabase
      .from("contracts")
      .insert({
        id: optimistic.id,
        profile_id: profileId,
        title: parsed.data.title,
        description: parsed.data.description,
        rarity: parsed.data.rarity,
      })
      .select("*")
      .single();
    if (error || !data) throw error ?? new Error("Contract create failed");

    const saved = mapContract(data as DbContract);
    writeLocalContracts([saved, ...readLocalContracts().filter((c) => c.id !== saved.id)]);
    return { success: true, data: saved, source: "supabase" };
  } catch (error) {
    return { success: true, data: optimistic, error: errorMessage(error), source: "local" };
  }
}

export async function sealTask(
  id: string,
  options: SealTaskOptions = {},
): Promise<ServiceResult<{ task: RpgContract; profile: RpgProfile }>> {
  if (!supabase || isLocalFallback) return sealTaskLocally(id, options);

  try {
    const profileId = await getProfileId();
    const { data, error } = await supabase.rpc("seal_contract_atomic", {
      p_contract_id: id,
      p_profile_id: profileId,
      p_xp_multiplier: options.xpMultiplier ?? 1,
      p_void_multiplier: options.voidMultiplier ?? 1,
    });
    if (error || !data) throw error ?? new Error("Contract seal failed");

    const rows = data as Array<{ contract: DbContract; profile: DbProfile }>;
    const first = rows[0];
    if (!first) throw new Error("Contract seal returned no data");

    const task = mapContract(first.contract);
    const profile = writeLocalProfile(mapProfile(first.profile));
    writeLocalContracts(
      readLocalContracts().map((contract) => (contract.id === id ? task : contract)),
    );
    return { success: true, data: { task, profile }, source: "supabase" };
  } catch (error) {
    const local = await sealTaskLocally(id, options);
    if (local.success) local.error = errorMessage(error);
    return local;
  }
}

async function sealTaskLocally(
  id: string,
  options: SealTaskOptions,
): Promise<ServiceResult<{ task: RpgContract; profile: RpgProfile }>> {
  const contracts = readLocalContracts();
  const target = contracts.find((contract) => contract.id === id);
  if (!target) return localError("Contract not found");
  if (target.isSealed) return localError("Contract already sealed");

  const sealedAt = new Date().toISOString();
  const sealed: RpgContract = {
    ...target,
    progress: 100,
    isSealed: true,
    sealedAt,
  };
  writeLocalContracts(contracts.map((contract) => (contract.id === id ? sealed : contract)));

  const xpGain = Math.floor(target.xpReward * Math.max(0, options.xpMultiplier ?? 1));
  const voidGain = Math.floor(target.voidReward * Math.max(0, options.voidMultiplier ?? 1));
  const profile = applyXp(readLocalProfile(), xpGain, voidGain);

  return localResult({ task: sealed, profile });
}

export async function deleteTask(id: string): Promise<ServiceResult<string>> {
  writeLocalContracts(readLocalContracts().filter((contract) => contract.id !== id));

  if (!supabase || isLocalFallback) return localResult(id);

  try {
    const profileId = await getProfileId();
    const { error } = await supabase
      .from("contracts")
      .delete()
      .eq("id", id)
      .eq("profile_id", profileId);
    if (error) throw error;
    return { success: true, data: id, source: "supabase" };
  } catch (error) {
    return { success: true, data: id, error: errorMessage(error), source: "local" };
  }
}

export async function fetchRelics(): Promise<ServiceResult<RpgMarketRelic[]>> {
  const local = readLocalRelics();
  if (!supabase || isLocalFallback) return localResult(local);

  try {
    const profileId = await getProfileId();
    await supabase.rpc("ensure_profile", { p_profile_id: profileId });
    const { data, error } = await supabase
      .from("market_relics")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });
    if (error || !data) throw error ?? new Error("Relics fetch failed");

    const relics = writeLocalRelics((data as DbMarketRelic[]).map(mapRelic));
    return { success: true, data: relics, source: "supabase" };
  } catch (error) {
    return { success: true, data: local, error: errorMessage(error), source: "local" };
  }
}

export async function createRelic(
  input: BlackMarketItemCreateInput,
  options: { id?: string } = {},
): Promise<ServiceResult<RpgMarketRelic>> {
  const parsed = blackMarketItemCreateSchema.safeParse(input);
  if (!parsed.success) {
    return localError(parsed.error.issues[0]?.message ?? "Invalid relic");
  }

  const optimistic = createLocalRelic(parsed.data, options.id);
  writeLocalRelics([optimistic, ...readLocalRelics().filter((relic) => relic.id !== optimistic.id)]);

  if (!supabase || isLocalFallback) return localResult(optimistic);

  try {
    const profileId = await getProfileId();
    await supabase.rpc("ensure_profile", { p_profile_id: profileId });
    const { data, error } = await supabase
      .from("market_relics")
      .insert({
        id: optimistic.id,
        profile_id: profileId,
        title: parsed.data.name,
        cost_void: parsed.data.costCredits,
        icon_type: parsed.data.iconId,
      })
      .select("*")
      .single();
    if (error || !data) throw error ?? new Error("Relic create failed");

    const saved = mapRelic(data as DbMarketRelic);
    writeLocalRelics([saved, ...readLocalRelics().filter((relic) => relic.id !== saved.id)]);
    return { success: true, data: saved, source: "supabase" };
  } catch (error) {
    return { success: true, data: optimistic, error: errorMessage(error), source: "local" };
  }
}

export async function purchaseRelic(
  id: string,
): Promise<ServiceResult<{ relic: RpgMarketRelic; profile: RpgProfile }>> {
  if (!supabase || isLocalFallback) return purchaseRelicLocally(id);

  try {
    const profileId = await getProfileId();
    const { data, error } = await supabase.rpc("purchase_relic_atomic", {
      p_relic_id: id,
      p_profile_id: profileId,
    });
    if (error || !data) throw error ?? new Error("Relic purchase failed");

    const rows = data as Array<{ relic: DbMarketRelic; profile: DbProfile }>;
    const first = rows[0];
    if (!first) throw new Error("Relic purchase returned no data");

    const relic = mapRelic(first.relic);
    const profile = writeLocalProfile(mapProfile(first.profile));
    writeLocalRelics(readLocalRelics().map((item) => (item.id === id ? relic : item)));
    return { success: true, data: { relic, profile }, source: "supabase" };
  } catch (error) {
    const local = await purchaseRelicLocally(id);
    if (local.success) local.error = errorMessage(error);
    return local;
  }
}

async function purchaseRelicLocally(
  id: string,
): Promise<ServiceResult<{ relic: RpgMarketRelic; profile: RpgProfile }>> {
  const relics = readLocalRelics();
  const relic = relics.find((item) => item.id === id);
  if (!relic) return localError("Relic not found");
  if (relic.redeemedAt !== null) return localError("Relic already redeemed");

  const profile = readLocalProfile();
  if (profile.voidCredits < relic.costCredits) {
    return localError("Insufficient Void Credits");
  }

  const redeemed: RpgMarketRelic = {
    ...relic,
    redeemedAt: new Date().toISOString(),
  };
  writeLocalRelics(relics.map((item) => (item.id === id ? redeemed : item)));
  const nextProfile = writeLocalProfile({
    ...profile,
    voidCredits: Math.max(0, profile.voidCredits - relic.costCredits),
  });

  return localResult({ relic: redeemed, profile: nextProfile });
}

export async function deleteRelic(id: string): Promise<ServiceResult<string>> {
  writeLocalRelics(readLocalRelics().filter((relic) => relic.id !== id));

  if (!supabase || isLocalFallback) return localResult(id);

  try {
    const profileId = await getProfileId();
    const { error } = await supabase
      .from("market_relics")
      .delete()
      .eq("id", id)
      .eq("profile_id", profileId)
      .is("redeemed_at", null);
    if (error) throw error;
    return { success: true, data: id, source: "supabase" };
  } catch (error) {
    return { success: true, data: id, error: errorMessage(error), source: "local" };
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Supabase unavailable; using local fallback";
}
