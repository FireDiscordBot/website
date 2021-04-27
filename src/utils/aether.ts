import fetcher from "./fetcher"

import { WebsiteGateway } from "@/interfaces/aether"
import { fire } from "@/constants"

export const getGateway = async (accessToken?: string): Promise<WebsiteGateway> => {
  const gateway: WebsiteGateway = await fetcher(`${fire.aetherApiUrl}/v2/gateway/website`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  })

  return gateway
}
