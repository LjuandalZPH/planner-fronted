import { z } from "zod";

export const BLACK_MARKET_ICON_IDS = [
  "scroll",
  "coffee",
  "utensils",
  "tv",
  "moon",
  "gift",
  "book_open",
  "heart",
  "gamepad_2",
  "music",
  "wine",
  "bed",
] as const;

export type BlackMarketIconId = (typeof BLACK_MARKET_ICON_IDS)[number];

export const BLACK_MARKET_ITEM_SOURCES = ["user", "catalog"] as const;
export type BlackMarketItemSource = (typeof BLACK_MARKET_ITEM_SOURCES)[number];

export interface BlackMarketItem {
  readonly id: string;
  readonly name: string;
  readonly costCredits: number;
  readonly iconId: BlackMarketIconId;
  readonly source: BlackMarketItemSource;
  /** ISO 8601 when the user sealed the deal (purchased / redeemed). */
  readonly redeemedAt: string | null;
}

export const blackMarketIconIdSchema = z.enum(BLACK_MARKET_ICON_IDS);

export const blackMarketItemCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  costCredits: z.coerce
    .number()
    .int("Whole credits only")
    .min(1, "At least 1 credit")
    .max(99999, "Too costly"),
  iconId: blackMarketIconIdSchema,
});

export type BlackMarketItemCreateInput = z.infer<typeof blackMarketItemCreateSchema>;

export const blackMarketItemStoredSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    costCredits: z.number().int().nonnegative(),
    iconId: blackMarketIconIdSchema,
    source: z.enum(BLACK_MARKET_ITEM_SOURCES),
    redeemedAt: z.union([z.string(), z.null()]).optional(),
  })
  .transform((row) => ({
    ...row,
    redeemedAt: row.redeemedAt ?? null,
  }));

export const blackMarketItemsArraySchema = z.array(blackMarketItemStoredSchema);
