export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: number;
  storeName?: string;
}

export interface LoginResponse {
  token: string;
  message: string;
}

export interface DecodedToken {
  nameid: string;
  email: string;
  role: string;
  exp: number;
}
