import { fire } from "@/constants"
import { AdminSessionData, BuildOverride, Reminder } from "@/interfaces/aether"
import { PremiumDiscordGuild } from "@/interfaces/discord"
import { GetCollectData } from "@/types"
import fetcher from "@/utils/fetcher"

export const requestWithAuth = <R = never>(accessToken: string, path: string, method?: string, body?: unknown) =>
  fetcher<R>(`${fire.aetherApiUrl}/${path}`, {
    body: body as BodyInit,
    method: method ?? "GET",
    headers: {
      "User-Agent": "Fire Website",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

export const fetchCustomerId = async (accessToken: string) => {
  const json = await requestWithAuth<{ id: string }>(accessToken, `stripe/customer`)
  return json.id
}

export const createStripeCheckoutSession = async (accessToken: string, servers: number) => {
  const json = await requestWithAuth<{ sessionId: string }>(
    accessToken,
    `stripe/sessions/checkout?servers=${servers}`,
    "POST",
  )
  return json.sessionId
}

export const createStripePortalSession = async (accessToken: string) => {
  const json = await requestWithAuth<{ url: string }>(accessToken, `stripe/sessions/billing`, "POST")
  return json.url
}

export const fetchPremiumGuilds = async (accessToken: string, sessionId: string) => {
  return await requestWithAuth<PremiumDiscordGuild[]>(accessToken, `guilds/premium?sessionId=${sessionId}`)
}

export const toggleGuildPremium = async (
  accessToken: string,
  subId: string,
  guildId: string,
  method: "PUT" | "DELETE",
) => {
  return await requestWithAuth<string[]>(accessToken, `subscriptions/${subId}/guilds/${guildId}/premium`, method)
}

export const createDataArchive = async (accessToken: string) => {
  const json = await requestWithAuth<{ url: string }>(accessToken, `data/collect`, "POST")
  return json.url
}

export const getDataRequest = async (accessToken: string) => {
  const json = await requestWithAuth<GetCollectData>(accessToken, `data/collect`, "GET")
  return json
}

export const fetchUserReminders = async (accessToken: string) => {
  return await requestWithAuth<Reminder[]>(accessToken, `user/reminders`)
}

export const createUserReminder = async (accessToken: string, body: { reminder: string; timestamp: number }) => {
  return await requestWithAuth<unknown>(accessToken, `user/reminders`, "POST", body)
}

export const deleteUserReminder = async (accessToken: string, timestamp: string) => {
  return await requestWithAuth<unknown>(accessToken, `user/reminders/${timestamp}`, "DELETE")
}

export const getBuildOverrides = async (accessToken: string) => {
  return await requestWithAuth<BuildOverride[]>(accessToken, `__development/overrides`, "GET")
}

export const getSessions = async (accessToken: string) => {
  return await requestWithAuth<AdminSessionData[]>(accessToken, `sessions`)
}
