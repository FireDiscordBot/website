import type { NextApiHandler } from "next"
import NextAuth, { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

import { discord } from "@/constants"

const discordProvider = DiscordProvider({
  authorization: "https://discord.com/oauth2/authorize?scope=identify+email+guilds+guilds.members.read&prompt=none",
  profile: (profile) => ({
    id: profile.id,
    username: profile.username,
    discriminator: profile.discriminator,
    avatar: profile.avatar,
    banner: profile.banner,
    // TODO: banner color
    email: profile.email,
    publicFlags: profile.public_flags,
    premiumType: profile.premium_type,
  }),
  clientId: discord.clientId,
  clientSecret: discord.clientSecret,
})

// const fresh: Record<string, AuthToken | null> = {}

// const refreshToken = async (token: AuthToken): Promise<AuthToken> => {
//   if (!token.refreshToken) return token

//   if (fresh[token.refreshToken] === null) await new Promise((r) => setTimeout(r, 5000))

//   if (fresh[token.refreshToken]) return fresh[token.refreshToken] as AuthToken
//   else fresh[token.refreshToken] = null

//   const data = {
//     client_id: discord.clientId,
//     client_secret: discord.clientSecret,
//     grant_type: "refresh_token",
//     refresh_token: token.refreshToken,
//   }

//   const response = await fetch(`https://discord.com/api/v9/oauth2/token`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams(data),
//   })

//   if (!response.ok)
//     return fresh[token.refreshToken] ? (fresh[token.refreshToken] as AuthToken) : { ...token, error: "RefreshFailed" }

//   const refreshed = (await response.json()) as AccessTokenResponse

//   return (fresh[token.refreshToken] = {
//     ...token,
//     accessToken: refreshed.access_token,
//     refreshToken: refreshed.refresh_token ?? token.refreshToken,
//     expiresAt: +new Date() + refreshed.expires_in * 1000 - 3600000,
//     lastRefresh: +new Date(),
//   })
// }

const nextAuthConfig: NextAuthOptions = {
  providers: [discordProvider],
  callbacks: {
    async jwt({ token, user, account }) {
      // Delete default properties added by Next-Auth
      delete token.name
      delete token.picture

      // Account and User are available only when signing
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at * 1000
      }

      if (user) {
        token.email = user.email
        token.username = user.username
        token.avatar = user.avatar ?? null
        token.banner = user.banner
        token.discriminator = user.discriminator
        token.publicFlags = user.publicFlags
        token.premiumType = user.premiumType
      }

      // TODO: check and refresh Discord access token
      //   if (token.accessToken) {
      //     const fetch = async (accessToken: string) => {
      //       const user = await fetchUser(accessToken).catch(() => {
      //         return null
      //       })
      //       if (user) {
      //         token.discriminator = user.discriminator
      //         token.publicFlags = user.public_flags
      //         token.image = getAvatarImage(user)
      //         token.name = user.username
      //         token.email = user.email
      //       }
      //       return user
      //     }
      //     let user = await fetch(token.accessToken)
      //     if (!user) {
      //       token = await refreshToken(token)
      //       if (token.accessToken) user = await fetch(token.accessToken)
      //     }
      //   }

      //   if (token.lastRefresh && +new Date() - token.lastRefresh > fire.refreshAfter) return await refreshToken(token)

      return token
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
      }

      session.user.id = token.sub ?? ""
      session.user.username = token.username
      session.user.discriminator = token.discriminator
      session.user.publicFlags = token.publicFlags
      session.user.premiumType = token.premiumType
      session.user.avatar = token.avatar
      session.user.banner = token.banner

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
