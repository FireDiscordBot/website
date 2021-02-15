import { fire } from "@/constants"

const requestWithAuth = (accessToken: string, path: string) =>
  fetch(`${fire.aetherApiUrl}/${path}`, {
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
