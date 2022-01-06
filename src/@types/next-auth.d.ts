import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    username: string
    email: string
    discriminator: string
    publicFlags: number
    premiumType: number
    avatar: string | null
    banner: string | null
  }

  interface Account {
    providerAccountId: string
    access_token: string
    refresh_token: string
    expires_at: number
    scope: string
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      discriminator: string
      avatar: string | null
      banner: string | null
      publicFlags: number
      premiumType: number
    }
    accessToken?: string
    refreshToken?: string
    expires: string
    // refresh?: () => Promise<AuthSession>
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    // OAuth
    accessToken: string
    refreshToken: string
    expiresAt: number

    // User info
    email: string
    username: string
    discriminator: string
    publicFlags: number
    premiumType: number
    avatar: string | null
    banner: string | null

    // lastRefresh?: number
    // error?: string
    // sub?: string
    // exp?: number
    // iat?: number
    // id: string
    // email: string
    // name: string
    // discriminator: string
    // image: string
    // banner: string | null
    // publicFlags: number
    // premiumType: number
  }
}
