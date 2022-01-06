// import { NetworkErrorData } from "./utils/fetcher"
import { Reminder } from "@/interfaces/aether"
import { AuthSession } from "@/interfaces/auth"
import { Plan } from "@/interfaces/fire"
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { PremiumDiscordGuild } from "./interfaces/discord"

export type AnyObject = Record<string, unknown>

export type ApiHandler<T = AnyObject> = NextApiHandler<ApiResponseBody<T>>

export type AuthenticatedApiHandler<T = AnyObject> = (
  session: AuthSession & { accessToken: string },
  req: NextApiRequest,
  res: NextApiResponse<ApiResponseBody<T>>,
) => void | Promise<void>

export type ApiErrorResponse = {
  success: false
  code: number
  error: string
}

export type ApiResponseBody<T = AnyObject> = T | ApiErrorResponse

export type GetSubscriptionsResponse = Plan[]

export type GetSubscriptionResponse =
  | {
      hasSubscription: false
    }
  | {
      hasSubscription: true
      subscription: {
        id: string
        name: string
        status: string
        servers: number
        start: number
        periodStart: number
        periodEnd: number
        trialEnd: number | null
        cancelAtPeriodEnd: boolean
      }
    }

export type PostSubscriptionResponse = { sessionId: string }

export type PostBillingPortalResponse = { url: string }

export type GetGuildsResponse = PremiumDiscordGuild[]

export type GetRemindersResponse = Reminder[]

export type PutTogglePremiumGuildResponse = string[]

export type PostCollectData = { url: string }

export type GetCollectData =
  | { status: 0; last_request: null }
  | { status: 1; last_request: number; url: string }
  | { status: 2; last_request: null; url: string }

export type PromotionMessage = {
  text: string
  expires: number
}
