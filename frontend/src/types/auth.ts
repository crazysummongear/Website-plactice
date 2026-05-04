export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
}

export interface User {
  userId: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  confirmPassword: string;
}