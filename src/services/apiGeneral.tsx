import apiClient from "./apiClient";
import type { AccountStats } from "../types/sharedInterfaces";
export async function createRoom(roomType?:string): Promise<string> {
  const response = await apiClient.get("/create-room",{params: roomType?{roomType}:undefined});
  return roomType === "private" ? response.data.privateSharedRoomId : response.data.publicSharedRoomId;
}

export async function updateStats(wpm:number,won:boolean): Promise<AccountStats> {
  const response = await apiClient.post("/user/profile/updateStats", {wpm:wpm,won: won });
  return response.data.message
}

export async function getStats(): Promise<AccountStats> {
  const response = await apiClient.post("/user/profile/getStats", {});
  return response.data.message;
}

export async function getStatsByUsername(username: string): Promise<AccountStats> {
  const response = await apiClient.get("/user/profile/statsByUsername", { params: { username } });
  return response.data.message;
}

