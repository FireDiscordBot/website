import { AlertColor } from "@mui/material/Alert"
import { createContext, ReactNode, useCallback, useState } from "react"

import { AppSnackbarProps } from "../ui/AppSnackbar"

interface AppSnackbarState {
  currentSnackbar: AppSnackbarProps | null
  showSnackbar: (message: string, duration: number, severity?: AlertColor, onClose?: () => void) => void
}

export const AppSnackbarContext = createContext<AppSnackbarState | null>(null)

interface AppSnackbarProviderProps {
  children: ReactNode
}

export function AppSnackbarProvider(props: AppSnackbarProviderProps) {
  const [currentSnackbar, setCurrentSnackbar] = useState<AppSnackbarProps | null>(null)

  const showSnackbar: AppSnackbarState["showSnackbar"] = useCallback(
    (message, duration = 10000, severity, onCloseSnackbar) => {
      function onClose() {
        setCurrentSnackbar(null)
        onCloseSnackbar?.()
      }

      setCurrentSnackbar({
        message,
        duration,
        severity,
        onClose,
      })
    },
    [setCurrentSnackbar],
  )

  const state: AppSnackbarState = {
    currentSnackbar,
    showSnackbar,
  }

  return <AppSnackbarContext.Provider value={state}>{props.children}</AppSnackbarContext.Provider>
}
