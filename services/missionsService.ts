import { apiFetch } from "./api";
import type { Mission } from "../components/mission/MissionCard";

export async function getMissions(): Promise<Mission[]> {
  return apiFetch<Mission[]>("/missions");
}

export async function getMissionById(id: string): Promise<Mission> {
  return apiFetch<Mission>(`/missions/${id}`);
}

