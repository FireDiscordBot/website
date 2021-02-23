import { fire } from "@/constants"
import fetcher from "@/utils/fetcher"

const requestWithAuth = (accessToken: string, path: string, method?: string) =>
  fetcher(`${fire.aetherApiUrl}/${path}`, {
    method: method ?? "GET",
    headers: {
      "User-Agent": "Fire Website",
      Authorization: `Bearer ${accessToken}`,
    },
  })

export const fetchCustomerId = async (accessToken: string) => {
  const json = await requestWithAuth(accessToken, `stripe/customer`)
  return json.id as string
}

export const createStripeCheckoutSession = async (accessToken: string, servers: number) => {
  const json = await requestWithAuth(accessToken, `stripe/sessions/checkout?servers=${servers}`, "POST")
  return json.sessionId as string
}

export const createStripePortalSession = async (accessToken: string) => {
  const json = await requestWithAuth(accessToken, `stripe/sessions/billing`, "POST")
  return json.url as string
}

export const fetchPremiumGuilds = async (accessToken: string) => {
  const json = await requestWithAuth(accessToken, `guilds/premium`)
  return json as string[]
}

export const toggleGuildPremium = async (accessToken: string, guildId: string) => {
  const json = await requestWithAuth(accessToken, `guilds/${guildId}/premium`, "PUT")
  return json as string[]
}
