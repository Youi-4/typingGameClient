import apiClient from "./apiClient";
export async function createRoom(roomType?:string): Promise<string> {
  const response = await apiClient.get("/create-room",{params: roomType?{roomType}:undefined});
  return roomType === "private" ? response.data.privateSharedRoomId : response.data.publicSharedRoomId;
}