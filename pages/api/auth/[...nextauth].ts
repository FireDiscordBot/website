import { NextApiRequest, NextApiResponse } from "next"
import NextAuth, { InitOptions } from 'next-auth'
import Providers from "next-auth/providers"
import type { AuthSession, AuthToken, AuthUser } from "@/interfaces/auth"
import type { DiscordApiUser } from "@/interfaces/discord"
import { getUserImage } from "@/utils/discord"
import { discord } from "../../../src/constants"

const discordProvider = Providers.Discord({
  scope: 'identify email guilds',
  profile: (profile: DiscordApiUser): AuthUser => ({
    id: profile.id,
    name: profile.username,
    discriminator: profile.discriminator,
    image: getUserImage(profile),
    email: profile.email,
  }),
  clientId: discord.clientId,
  clientSecret: discord.clientSecret,
})

const nextAuthConfig: InitOptions = {
  providers: [discordProvider],
  callbacks: {
    async jwt(token: AuthToken, user: AuthUser, account) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken
      }
      if (user) {
        token.discriminator = user.discriminator
      }
      return token
    },
    async session(session: AuthSession, token: AuthToken) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      session.user.id = token.sub ?? ""
      session.user.discriminator = token.discriminator
      return session
    },
  },
}

const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, nextAuthConfig)

export default handler

