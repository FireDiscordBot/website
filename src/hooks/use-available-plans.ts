import useSWR, { SWRConfiguration } from "swr"

import type { Plan } from "@/interfaces/fire"
import type { ApiResponse } from "@/lib/api/response"

const useAvailablePlans = (load = true, config?: SWRConfiguration<ApiResponse<Plan[]>>) => {
  const { data: res, error } = useSWR<ApiResponse<Plan[]>>(load ? "/api/stripe/subscriptions" : null, config)

  return {
    plans: res?.success ? res.data : undefined,
    isLoading: !error && !res,
    isError: error || !res?.success,
  }
}

export default useAvailablePlans
