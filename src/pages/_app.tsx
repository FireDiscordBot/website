import SimpleSnackbar from "@/components/SimpleSnackbar"
import { defaultSeoConfig } from "@/constants"
import useWebsocket from "@/hooks/use-websocket"
import { Notification } from "@/interfaces/aether"
import { AetherClient } from "@/lib/ws/aether-client"
import { Emitter } from "@/lib/ws/socket-emitter"
import theme from "@/theme"
import fetcher from "@/utils/fetcher"
import { isBrowser } from "@/utils/is-browser"
import moment from "@date-io/moment"
import CssBaseline from "@material-ui/core/CssBaseline"
import { ThemeProvider } from "@material-ui/core/styles"
import { MuiPickersUtilsProvider } from "@material-ui/pickers"
import { Provider as SessionProvider } from "next-auth/client"
import { DefaultSeo } from "next-seo"
import { AppProps } from "next/app"
import Head from "next/head"
import * as React from "react"
import { SWRConfig } from "swr"
import "../nprogress.css"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

export const emitter = new Emitter()
export let handler: AetherClient

function FireApp(props: AppProps) {
  const { Component, pageProps } = props
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
      <MuiPickersUtilsProvider utils={moment}>
        <Head>
          <title>Fire</title>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <DefaultSeo {...defaultSeoConfig} />
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
      </MuiPickersUtilsProvider>
    </>
  )
}

const initHandler = async (handler: AetherClient) => {
  handler.devToolsWarning()
  handler.initialised = true
}

export default FireApp
