type JwtToken = {
  accessToken?: string;
  sub?: string;
  exp?: number;
  iat?: number;
}

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  discriminator: string;
  image: string;
}

export type AuthToken = JwtToken & Exclude<AuthUser, 'id'>

export type AuthSession = {
  user: AuthUser;
  accessToken?: string;
  expires: string;
}

declare module 'next-auth/client' {
  function useSession(): [AuthSession | null | undefined, boolean];
}