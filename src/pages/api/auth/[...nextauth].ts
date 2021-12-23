import { NextApiHandler } from "next"
import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

import type { AccessTokenResponse, AuthToken, AuthUser } from "@/interfaces/auth"
import type { APIUser } from "@/interfaces/discord"
import { fetchUser, getBannerImage, getAvatarImage } from "@/utils/discord"
import { discord, fire } from "@/constants"

const discordProvider = DiscordProvider({
  authorization: "https://discord.com/oauth2/authorize?scope=identify+email+guilds+guilds.members.read&prompt=none",
  profile: (profile: APIUser): AuthUser => ({
    id: profile.id,
    name: profile.username,
    discriminator: profile.discriminator,
    image: getAvatarImage(profile, process.env.USE_MOD_SIX == "true"),
    banner: getBannerImage(profile),
    email: profile.email,
    publicFlags: profile.public_flags,
    premiumType: profile.premium_type,
  }),
  clientId: discord.clientId,
  clientSecret: discord.clientSecret,
})

const fresh: Record<string, AuthToken | null> = {}

const refreshToken = async (token: AuthToken): Promise<AuthToken> => {
  if (!token.refreshToken) return token

  if (fresh[token.refreshToken] === null) await new Promise((r) => setTimeout(r, 5000))

  if (fresh[token.refreshToken]) return fresh[token.refreshToken] as AuthToken
  else fresh[token.refreshToken] = null

  const data = {
    client_id: discord.clientId,
    client_secret: discord.clientSecret,
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  }

  const response = await fetch(`https://discord.com/api/v9/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  })

  if (!response.ok)
    return fresh[token.refreshToken] ? (fresh[token.refreshToken] as AuthToken) : { ...token, error: "RefreshFailed" }

  const refreshed = (await response.json()) as AccessTokenResponse

  return (fresh[token.refreshToken] = {
    ...token,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? token.refreshToken,
    expiresAt: +new Date() + refreshed.expires_in * 1000 - 3600000,
    lastRefresh: +new Date(),
  })
}

const nextAuthConfig: NextAuthOptions = {
  providers: [discordProvider],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = +new Date() + (account.expires_at ?? 1) * 1000 - 3600000
        token.lastRefresh = +new Date() // we didn't refresh but the token is fresh out of the oven
      }
      if (user) {
        token.discriminator = user.discriminator
        token.publicFlags = user.publicFlags
        token.premiumType = user.premiumType
      }

      if (token.accessToken) {
        const fetch = async (accessToken: string) => {
          const user = await fetchUser(accessToken).catch(() => {
            return null
          })
          if (user) {
            token.discriminator = user.discriminator
            token.publicFlags = user.public_flags
            token.image = getAvatarImage(user)
            token.name = user.username
            token.email = user.email
          }
          return user
        }
        let user = await fetch(token.accessToken)
        if (!user) {
          token = await refreshToken(token)
          if (token.accessToken) user = await fetch(token.accessToken)
        }
      }

      if (token.lastRefresh && +new Date() - token.lastRefresh > fire.refreshAfter) return await refreshToken(token)

      return token
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        if (token.lastRefresh) session.lastRefresh = new Date(token.lastRefresh).toISOString()
      }
      session.error = token.error
      session.user.id = token.sub ?? ""
      session.user.discriminator = token.discriminator
      session.user.publicFlags = token.publicFlags
      session.user.premiumType = token.premiumType
      session.user.image = token.image

      return session
    },
  },
  secret: process.env.NEXT_AUTH_SECRET, // openssl rand -base64 32
  jwt: {
    secret: process.env.JWT_SECRET, // openssl rand -base64 64
  },
}

const handler: NextApiHandler = (req, res) => NextAuth(req, res, nextAuthConfig)

export default handler
