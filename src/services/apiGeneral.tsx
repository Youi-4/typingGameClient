import apiClient from "./apiClient";
export async function createRoom(): Promise<string> {
  const response = await apiClient.get("/create-room");
  return response.data.sharedRoomId;
}