import {
  createRelic,
  createTask,
  fetchProfile,
  fetchRelics,
  fetchTasks,
  purchaseRelic,
  sealTask,
  updateProfile,
} from "@/services/supabaseService";

describe("supabaseService local fallback", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates and fetches contracts from localStorage when Supabase is not configured", async () => {
    const created = await createTask({
      title: "Finish the ritual",
      description: "Ship the final integration",
      rarity: "rare",
    });

    expect(created.success).toBe(true);
    expect(created.source).toBe("local");
    expect(created.data?.xpReward).toBe(30);
    expect(created.data?.progress).toBe(0);

    const fetched = await fetchTasks();
    expect(fetched.data).toHaveLength(1);
    expect(fetched.data?.[0].title).toBe("Finish the ritual");
  });

  it("seals a local contract and updates profile XP, level, and void credits", async () => {
    const created = await createTask({
      title: "Legendary push",
      description: "",
      rarity: "legendary",
    });

    const sealed = await sealTask(created.data?.id ?? "", {
      xpMultiplier: 1,
      voidMultiplier: 1,
    });

    expect(sealed.success).toBe(true);
    expect(sealed.data?.task.progress).toBe(100);
    expect(sealed.data?.profile.level).toBe(2);
    expect(sealed.data?.profile.experience).toBe(50);
    expect(sealed.data?.profile.voidCredits).toBe(25);
  });

  it("prevents relic purchases when the profile lacks Void Credits", async () => {
    const relic = await createRelic({
      name: "Coffee break",
      costCredits: 5,
      iconId: "coffee",
    });

    const purchase = await purchaseRelic(relic.data?.id ?? "");
    expect(purchase.success).toBe(false);
    expect(purchase.error).toMatch(/Insufficient/i);
  });

  it("redeems a relic and deducts credits locally", async () => {
    await updateProfile({ voidCredits: 10 });
    const relic = await createRelic({
      name: "Walk outside",
      costCredits: 4,
      iconId: "heart",
    });

    const purchase = await purchaseRelic(relic.data?.id ?? "");
    const profile = await fetchProfile();
    const relics = await fetchRelics();

    expect(purchase.success).toBe(true);
    expect(profile.data?.voidCredits).toBe(6);
    expect(relics.data?.[0].redeemedAt).not.toBeNull();
  });
});
