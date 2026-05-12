"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bed,
  BookOpen,
  Coffee,
  Gamepad2,
  Gift,
  Heart,
  Moon,
  Music,
  Scroll,
  Tv,
  Utensils,
  Wine,
} from "lucide-react";
import type { BlackMarketIconId } from "@/types/black-market";

export const BLACK_MARKET_ICONS: Record<BlackMarketIconId, LucideIcon> = {
  scroll: Scroll,
  coffee: Coffee,
  utensils: Utensils,
  tv: Tv,
  moon: Moon,
  gift: Gift,
  book_open: BookOpen,
  heart: Heart,
  gamepad_2: Gamepad2,
  music: Music,
  wine: Wine,
  bed: Bed,
};

interface BlackMarketGlyphProps {
  id: BlackMarketIconId;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean | "true" | "false";
}

export function BlackMarketGlyph({
  id,
  className,
  size = 22,
  ...rest
}: BlackMarketGlyphProps) {
  const Icon = BLACK_MARKET_ICONS[id];
  return <Icon className={className} size={size} {...rest} />;
}
