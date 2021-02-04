import {NextApiRequest, NextApiResponse} from "next"
import NextAuth, {InitOptions} from 'next-auth'
import Providers from "next-auth/providers"
import type {AuthSession, AuthToken, AuthUser} from "../../../src/interfaces/auth"
import type {DiscordApiUser} from "../../../src/interfaces/discord"

const discordProvider = Providers.Discord({
  scope: 'identify email guilds',
  profile: (profile: DiscordApiUser): AuthUser => {
    function getImageUrl(profile: DiscordApiUser) {
      if (profile.avatar === null) {
        const defaultAvatarNumber = parseInt(profile.discriminator) % 5
        return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
      } else {
        const format = profile.avatar.startsWith("a_") ? 'gif' : 'png'
        return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
      }
    }

    return {
      id: profile.id,
      name: profile.username,
      discriminator: profile.discriminator,
      image: getImageUrl(profile),
      email: profile.email
    }
  },
  clientId: process.env.DISCORD_CLIENT_ID!!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!!,
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
    }
  },
}

const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, nextAuthConfig)

export default handler

