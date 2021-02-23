import useSWR from "swr"

import { GetSubscriptionResponse } from "@/types"

const useCurrentSubscription = (hasSession = true) => {
  const { data, error } = useSWR<GetSubscriptionResponse>(hasSession ? `/api/user/subscription` : null)

  const hasSubscription = data && data.hasSubscription
  const subscription = data?.hasSubscription ? data?.subscription : undefined

  return {
    hasSubscription,
    subscription,
    isLoading: !error && !data,
    error,
  } as const
}

export default useCurrentSubscription
