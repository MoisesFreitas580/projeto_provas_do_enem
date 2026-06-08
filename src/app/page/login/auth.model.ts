export interface TokenAuth {
  access: string;
  refresh?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserData {
  id: string | number;
  name: string;
  email: string;
  role?: string;
}