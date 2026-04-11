import apiClient from "./apiClient";
import type {
  CreateRoomResponseDto,
  LeaderboardEntryDto,
  LeaderboardResponseDto,
  PublicProfileDto,
  PublicProfileResponseDto,
  StatsDto,
  StatsResponseDto,
} from "../types/api";

export async function createRoom(roomType?: string): Promise<string> {
  const response = await apiClient.get<CreateRoomResponseDto>(
    "/create-room",
    { params: roomType ? { roomType } : undefined }
  );
  return response.data.roomId;
}

export async function updateStats(wpm: number, won: boolean): Promise<StatsDto> {
  const response = await apiClient.post<StatsResponseDto>(
    "/user/profile/updateStats",
    { wpm, won }
  );
  return response.data.stats;
}

export async function getStats(): Promise<StatsDto> {
  const response = await apiClient.post<StatsResponseDto>("/user/profile/getStats", {});
  return response.data.stats;
}

export async function getStatsByUsername(username: string): Promise<StatsDto> {
  const response = await apiClient.get<StatsResponseDto>(
    "/user/profile/statsByUsername",
    { params: { username } }
  );
  return response.data.stats;
}

export async function getLeaderboard(): Promise<LeaderboardEntryDto[]> {
  const response = await apiClient.get<LeaderboardResponseDto>("/user/profile/leaderboard");
  return response.data.leaderboard;
}

export async function getPublicProfile(username: string): Promise<PublicProfileDto> {
  const response = await apiClient.get<PublicProfileResponseDto>(
    `/user/profile/public/${encodeURIComponent(username)}`
  );
  return response.data.profile;
}

