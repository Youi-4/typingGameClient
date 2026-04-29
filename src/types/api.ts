export interface AuthUserDto {
  id: string;
  email: string;
  userName?: string;
}

export interface LoginRequestDto {
  userName_or_email: string;
  password: string;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  user: AuthUserDto;
}

export interface SignupRequestDto {
  email: string;
  password: string;
  user: string;
  verified: boolean;
}

export interface SignupResponseDto {
  success: boolean;
  message: string;
}

export interface AuthStatusResponseDto {
  success: boolean;
  user: AuthUserDto;
}

export interface RefreshTokenResponseDto {
  success: boolean;
  message: string;
}

export interface SocketTokenResponseDto {
  socketToken: string;
  guestId?: string;
}

export interface StatsDto {
  race_avg: number;
  race_last: number;
  race_best: number;
  race_won: number;
  race_completed: number;
}

export interface StatsResponseDto {
  stats: StatsDto;
}

export interface LeaderboardEntryDto {
  username: string;
  race_best: number;
  race_avg: number;
  race_won: number;
  race_completed: number;
}

export interface LeaderboardResponseDto {
  leaderboard: LeaderboardEntryDto[];
}

export interface CreateRoomResponseDto {
  roomId: string;
  roomType: "public" | "private";
}

export interface ApiError {
  response?: {
    data?: {
      id?: string;
      error?: string;
      message?: string;
    };
  };
}

export interface PublicProfileStatsDto {
  race_avg: number;
  race_best: number;
  race_won: number;
  race_completed: number;
}

export interface PublicProfileDto {
  username: string;
  bio: string | null;
  avatar_color: string | null;
  stats: PublicProfileStatsDto;
}

export interface PublicProfileResponseDto {
  profile: PublicProfileDto;
}

export interface RaceHistoryEntryDto {
  wpm: number;
  accuracy: number;
  mode: string;
  created_at: string;
}

export interface RaceHistoryResponseDto {
  history: RaceHistoryEntryDto[];
}
