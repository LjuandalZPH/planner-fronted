import { apiFetch } from "./api";

export interface MissionSuggestion {
  title: string;
  description: string;
  xp: number;
}

export async function generateMissionSuggestion(
  context: string,
): Promise<MissionSuggestion> {
  return apiFetch<MissionSuggestion>("/ai/suggest-mission", {
    method: "POST",
    body: JSON.stringify({ context }),
  });
}

