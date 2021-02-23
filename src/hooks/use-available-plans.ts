import useSWR, { ConfigInterface } from "swr"

import { Plan } from "@/interfaces/fire"

const useAvailablePlans = (load = true, config?: ConfigInterface<Plan[]>) => {
  const { data, error } = useSWR<Plan[]>(load ? "/api/stripe/subscriptions" : null, config)

  return {
    plans: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export default useAvailablePlans
