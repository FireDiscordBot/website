import type { PremiumDiscordGuild } from "./interfaces/discord"
import type { Reminder } from "@/interfaces/aether"
import type { Plan } from "@/interfaces/fire"

export type AnyObject = Record<string, unknown>

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
