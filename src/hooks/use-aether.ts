import { useContext } from "react"

import { AetherClientContext } from "@/components/providers/AetherProvider"

export default function useAether() {
  return useContext(AetherClientContext)
}
