import { NextApiHandler } from "next"
import NextAuth, { InitOptions } from "next-auth"
import Providers from "next-auth/providers"

import type { AccessTokenResponse, AuthSession, AuthToken, AuthUser } from "@/interfaces/auth"
import type { APIUser } from "@/interfaces/discord"
import { fetchUser, getUserImage } from "@/utils/discord"
import { discord } from "@/constants"

const discordProvider = Providers.Discord({
  scope: "identify email guilds",
  profile: (profile: APIUser): AuthUser => ({
    id: profile.id,
    name: profile.username,
    discriminator: profile.discriminator,
    image: getUserImage(profile, process.env.USE_MOD_SIX == "true"),
    email: profile.email,
    publicFlags: profile.public_flags,
    premiumType: profile.premium_type,
  }),
  clientId: discord.clientId,
  clientSecret: discord.clientSecret,
})

const refreshToken = async (token: AuthToken): Promise<AuthToken> => {
  if (!token.refreshToken) return token

  const data = {
    client_id: discord.clientId,
    client_secret: discord.clientSecret,
    grant_type: "refresh_token",
    refresh_token: token.refreshToken,
  }

  const response = await fetch(`https://discord.com/api/v8/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  })

  if (!response.ok) return token

  const refreshed = (await response.json()) as AccessTokenResponse
  token.accessToken = refreshed.access_token
  token.refreshToken = refreshed.refresh_token ?? token.refreshToken
  token.expiresAt = +new Date() + refreshed.expires_in * 1000 - 3600000

  return token
}

const nextAuthConfig: InitOptions = {
  providers: [discordProvider],
  callbacks: {
    async jwt(token: AuthToken, user: AuthUser, account) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken
        token.refreshToken = account.refreshToken
        token.expiresAt = +new Date() + account.expires_in * 1000 - 3600000
      }
      if (user) {
        token.discriminator = user.discriminator
        token.publicFlags = user.publicFlags
        token.premiumType = user.premiumType
      }

      if (token.accessToken) {
        const user = await fetchUser(token.accessToken).catch(() => {
          return null
        })
        if (user) {
          token.discriminator = user.discriminator
          token.publicFlags = user.public_flags
          token.image = getUserImage(user)
          token.name = user.username
          token.email = user.email
        }
      }

      if (typeof token.expiresAt == "number" && +new Date() > token.expiresAt)
        return await refreshToken(token).catch(() => token)
      else return token
    },
    async session(session: AuthSession, token: AuthToken) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
      }
      session.user.id = token.sub ?? ""
      session.user.discriminator = token.discriminator
      session.user.publicFlags = token.publicFlags
      session.user.premiumType = token.premiumType
      session.user.image = token.image
      return session
    },
  },
  jwt: {
    encryption: true,
    secret: process.env.JWT_SECRET, // openssl rand -base64 64
    signingKey: process.env.JWT_SIGNING_KEY, // npx node-jose-tools newkey -s 256 -t oct -a HS512
    encryptionKey: process.env.JWT_ENCRYPTION_KEY, // npx node-jose-tools newkey -s 256 -t oct -a A256GCM -u enc
  },
}

const handler: NextApiHandler = (req, res) => NextAuth(req, res, nextAuthConfig)

export default handler
