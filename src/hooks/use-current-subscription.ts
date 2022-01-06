import useSWR from "swr"

import type { ApiResponse } from "@/lib/api/response"
import { GetSubscriptionResponse } from "@/types"

const useCurrentSubscription = (hasSession = true) => {
  const { data: res, error } = useSWR<ApiResponse<GetSubscriptionResponse>>(
    hasSession ? `/api/user/subscription` : null,
  )

  const hasSubscription = res?.success && res.data.hasSubscription
  const subscription = res?.success && res.data.hasSubscription ? res.data.subscription : undefined

  return {
    hasSubscription,
    subscription,
    isLoading: !error && !res,
    error,
  } as const
}

export default useCurrentSubscription
