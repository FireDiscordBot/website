import { NextApiHandler } from "next"
import NextAuth, { InitOptions } from "next-auth"
import Providers from "next-auth/providers"

import type { AuthSession, AuthToken, AuthUser } from "@/interfaces/auth"
import type { APIUser } from "@/interfaces/discord"
import { getUserImage } from "@/utils/discord"
import { discord } from "@/constants"

const discordProvider = Providers.Discord({
  scope: "identify email guilds",
  profile: (profile: APIUser): AuthUser => ({
    id: profile.id,
    name: profile.username,
    discriminator: profile.discriminator,
    image: getUserImage(profile),
    email: profile.email,
    publicFlags: profile.public_flags,
    premiumType: profile.premium_type,
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
        token.publicFlags = user.publicFlags
        token.premiumType = user.premiumType
      }
      return token
    },
    async session(session: AuthSession, token: AuthToken) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      session.user.id = token.sub ?? ""
      session.user.discriminator = token.discriminator
      session.user.publicFlags = token.publicFlags
      session.user.premiumType = token.premiumType
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
