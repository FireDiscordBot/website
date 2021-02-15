import { IncomingMessage } from "http"

type JwtToken = {
  accessToken?: string
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
  publicFlags: number
  premiumType: number
}

export type AuthToken = JwtToken & Exclude<AuthUser, "id">

export type AuthSession = {
  user: AuthUser
  accessToken?: string
  expires: string
}

declare module "next-auth/client" {
  type NextContext = {
    req?: IncomingMessage
    ctx?: { req: IncomingMessage }
  }

  function useSession(): [AuthSession | null | undefined, boolean]

  function session(
    context?: NextContext & {
      triggerEvent?: boolean
    },
  ): Promise<AuthSession | null>
}
