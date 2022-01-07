import useSWR, { SWRConfiguration } from "swr"

import type { ApiResponse } from "@/lib/api/response"
import { PremiumPlan } from "@/lib/stripe/types"

const useAvailablePlans = (load = true, config?: SWRConfiguration<ApiResponse<PremiumPlan[]>>) => {
  const { data: res, error } = useSWR<ApiResponse<PremiumPlan[]>>(load ? "/api/stripe/plans" : null, config)

  return {
    plans: res?.success ? res.data : undefined,
    isLoading: !error && !res,
    isError: error || !res?.success,
  }
}

export default useAvailablePlans
