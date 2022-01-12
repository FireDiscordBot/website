import { fire } from "@/constants"
import { AdminSessionData, BuildOverride, Reminder } from "@/interfaces/aether"
import { PremiumDiscordGuild } from "@/interfaces/discord"
import { GetCollectData } from "@/types"

const request = async <R = void, B = unknown>(
  path: string,
  method = "GET",
  headers?: HeadersInit,
  body?: B,
  options?: RequestInit,
): Promise<R> => {
  const response = await fetch(`${fire.aetherApiUrl}/${path}`, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: {
      "User-Agent": "Fire Website",
      ...headers,
    },
    ...options,
  })

  if (!(response.status >= 200 && response.status <= 300)) {
    throw {}
  }

  return response.json()
}

const requestWithAuth = <R = void, B = unknown>(
  accessToken: string,
  path: string,
  method = "GET",
  body?: B,
  options?: RequestInit,
) =>
  request<R, B>(
    path,
    method,
    {
      Authorization: `Bearer ${accessToken}`,
    },
    body,
    options,
  )

export const fetchWebsiteGateway = (accessToken: string) => {
  return requestWithAuth<{ url: string }>(accessToken, "v2/gateway/website", "GET")
}

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
  return requestWithAuth<PremiumDiscordGuild[]>(accessToken, `guilds/premium?sessionId=${sessionId}`)
}

export const toggleGuildPremium = async (
  accessToken: string,
  subId: string,
  guildId: string,
  method: "PUT" | "DELETE",
) => {
  return requestWithAuth<string[]>(accessToken, `subscriptions/${subId}/guilds/${guildId}/premium`, method)
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
  return requestWithAuth<Reminder[]>(accessToken, `user/reminders`)
}

export const createUserReminder = async (accessToken: string, body: { reminder: string; timestamp: number }) => {
  return requestWithAuth<void>(accessToken, `user/reminders`, "POST", body)
}

export const deleteUserReminder = async (accessToken: string, timestamp: string) => {
  return requestWithAuth<void>(accessToken, `user/reminders/${timestamp}`, "DELETE")
}

export const getBuildOverrides = async (accessToken: string) => {
  return requestWithAuth<BuildOverride[]>(accessToken, `__development/overrides`, "GET")
}

export const getSessions = async (accessToken: string) => {
  return requestWithAuth<AdminSessionData[]>(accessToken, `sessions`)
}
