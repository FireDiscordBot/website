import * as React from "react"
import Head from "next/head"
import { AppProps } from "next/app"
import { getSession, Provider as SessionProvider } from "next-auth/client"
import { DefaultSeo } from "next-seo"
import { SWRConfig } from "swr"
import { ThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import { MuiPickersUtilsProvider } from "@material-ui/pickers"
import moment from "@date-io/moment"

import { defaultSeoConfig } from "@/constants"
import fetcher from "@/utils/fetcher"
import theme from "@/theme"
import { isBrowser } from "@/utils/is-browser"
import "../nprogress.css"
import useWebsocket from "@/hooks/use-websocket"
import { Emitter } from "@/lib/ws/socket-emitter"
import { EventHandler } from "@/lib/ws/event-handler"
import SimpleSnackbar from "@/components/SimpleSnackbar"
import { Notification } from "@/interfaces/aether"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

export const emitter = new Emitter()
export let handler: EventHandler

function FireApp(props: AppProps) {
  const { Component, pageProps } = props
  const [notification, setNotification] = React.useState<Notification | undefined>(undefined)

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side")
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, [])

  handler = useWebsocket(emitter) as EventHandler
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

const initHandler = async (handler: EventHandler) => {
  if (!handler.auth) {
    const session = await getSession()
    if (session) handler.auth = session
  }
  if (!handler.identified) await handler.identify()
  handler.devToolsWarning()
  handler.initialised = true
}

export default FireApp
