import type { MissionRarity } from "@/lib/gamification";
import type { BlackMarketIconId } from "@/types/black-market";

export interface DbProfile {
  id: string;
  level: number;
  experience: number;
  void_credits: number;
  streak_count: number;
  last_completion_date: string | null;
  rank_title: string;
  created_at?: string;
  updated_at?: string;
}

export interface RpgProfile {
  id: string;
  level: number;
  experience: number;
  voidCredits: number;
  streakCount: number;
  lastCompletionDate: string | null;
  rankTitle: string;
}

export interface DbContract {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  rarity: MissionRarity;
  xp_reward: number;
  void_reward: number;
  is_sealed: boolean;
  created_at: string;
  sealed_at: string | null;
}

export interface RpgContract {
  id: string;
  title: string;
  description: string;
  rarity: MissionRarity;
  progress: number;
  xpReward: number;
  voidReward: number;
  isSealed: boolean;
  createdAt: string;
  sealedAt: string | null;
}

export interface DbMarketRelic {
  id: string;
  profile_id: string;
  title: string;
  cost_void: number;
  icon_type: BlackMarketIconId;
  redeemed_at: string | null;
  created_at: string;
}

export interface RpgMarketRelic {
  id: string;
  name: string;
  costCredits: number;
  iconId: BlackMarketIconId;
  source: "user";
  redeemedAt: string | null;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: "supabase" | "local";
}
