import { useContext } from "react"

import { AppSnackbarContext } from "@/components/providers/AppSnackbarProvider"

export default function useAppSnackbar() {
  const state = useContext(AppSnackbarContext)
  if (!state) {
    throw new Error("AppSnackbarProvider not found")
  }

  return state
}
