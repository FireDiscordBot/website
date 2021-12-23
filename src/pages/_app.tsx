import SimpleSnackbar from "@/components/SimpleSnackbar"
import { defaultSeoConfig } from "@/constants"
import useWebsocket from "@/hooks/use-websocket"
import { Notification } from "@/interfaces/aether"
import { AetherClient } from "@/lib/ws/aether-client"
import { Emitter } from "@/lib/ws/socket-emitter"
import theme from "@/theme"
import fetcher from "@/utils/fetcher"
import { isBrowser } from "@/utils/is-browser"
import AdapterMoment from "@mui/lab/AdapterMoment"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import CssBaseline from "@mui/material/CssBaseline"
import { CacheProvider } from "@emotion/react"
import { ThemeProvider } from "@mui/material/styles"
import { SessionProvider } from "next-auth/react"
import { DefaultSeo } from "next-seo"
import { AppProps } from "next/app"
import Head from "next/head"
import * as React from "react"
import { SWRConfig } from "swr"
import "../nprogress.css"
import createEmotionCache from "@/utils/createEmotionCache"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

export const emitter = new Emitter()
export let handler: AetherClient

const clientSideEmotionCache = createEmotionCache()

function FireApp(props: AppProps) {
  // @ts-expect-error
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props
  const [notification, setNotification] = React.useState<Notification | undefined>(undefined)

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side")
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, [])

  handler = useWebsocket(emitter) as AetherClient
  if (handler && !handler.initialised) {
    initHandler(handler)
  }

  emitter.removeAllListeners("NOTIFICATION")
  emitter.on("NOTIFICATION", setNotification)

  const onFinishCloseAnimation = () => setNotification(undefined)

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Head>
          <title>Fire</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <DefaultSeo {...defaultSeoConfig} />
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            <SWRConfig value={{ fetcher: fetcher }}>
              <SessionProvider session={pageProps.session}>
                <CssBaseline />
                <Component {...pageProps} />
                <SimpleSnackbar
                  message={notification?.text}
                  severity={notification?.severity}
                  horizontal={notification?.horizontal}
                  vertical={notification?.vertical}
                  autoHideDuration={notification?.autoHideDuration}
                  onFinishCloseAnimation={onFinishCloseAnimation}
                />
              </SessionProvider>
            </SWRConfig>
          </ThemeProvider>
        </CacheProvider>
      </LocalizationProvider>
    </>
  )
}

const initHandler = async (handler: AetherClient) => {
  handler.devToolsWarning()
  handler.initialised = true
}

export default FireApp
