export interface AccountStats {
  race_avg: number;
  race_last: number;
  race_best: number;
  race_won: number;
  race_completed: number;
}
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface LoginValues {
  userName_or_email: string;
  password: string;
}
export interface SignUpValues {
  email: string;
  password: string;
  user:string;
  verified: boolean;
}

export interface ApiError {
  response?: {
    data?: {
      id?: string;
      error?: string;
    };
  };
}


