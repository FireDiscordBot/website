type JwtToken = {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  lastRefresh?: number
  error?: string
  sub?: string
  exp?: number
  iat?: number
}

export type AuthUser = {
  id: string
  email: string
  name: string
  discriminator: string
  image: string
  banner: string | null
  publicFlags: number
  premiumType: number
}

export type AuthToken = JwtToken & Exclude<AuthUser, "id">

export type AccessTokenResponse = {
  access_token: string
  token_type: "Bearer"
  expires_in: number
  refresh_token: string
  scope: string
}

export type AuthSession = {
  user: AuthUser
  accessToken?: string
  refreshToken?: string
  expires: string
  lastRefresh: string
  error?: string
  refresh?: () => Promise<AuthSession>
}

declare module "next-auth" {
  interface Session {
    user: AuthUser
    accessToken?: string
    refreshToken?: string
    expires: string
    refresh?: () => Promise<AuthSession>
  }

  interface User {
    id: string
    email: string
    name: string
    discriminator: string
    image: string
    banner: string | null
    publicFlags: number
    premiumType: number
  }

  interface Account {
    providerAccountId: string
    access_token: string
    refresh_token: string
    expires_at: number
    scope: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    lastRefresh?: number
    error?: string
    sub?: string
    exp?: number
    iat?: number
    id: string
    email: string
    name: string
    discriminator: string
    image: string
    banner: string | null
    publicFlags: number
    premiumType: number
  }
}
