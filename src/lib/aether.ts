import { fire } from "@/constants"

const requestWithAuth = (accessToken: string, path: string, method?: string) =>
  fetch(`${fire.aetherApiUrl}/${path}`, {
    method: method ?? "GET",
    headers: {
      "User-Agent": "Fire Website",
      Authorization: `Bearer ${accessToken}`,
    },
  })

export const fetchCustomerId = async (accessToken: string) => {
  const response = await requestWithAuth(accessToken, `stripe/customer`)
  const json = await response.json()

  return json.id as string
}

export const createStripeSession = async (accessToken: string, servers: number) => {
  const response = await requestWithAuth(accessToken, `stripe/sessions/checkout?servers=${servers}`, "POST")
  const json = await response.json()

  return json.sessionId as string
}

export const fetchPremiumGuilds = async (accessToken: string) => {
  const response = await requestWithAuth(accessToken, `guilds/premium`)
  const json = await response.json()

  return json as string[]
}

export const toggleGuildPremium = async (accessToken: string, guildId: string) => {
  const response = await requestWithAuth(accessToken, `guilds/${guildId}/premium`, "PUT")
  const json = await response.json()

  return json as string[]
}
