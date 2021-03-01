import * as React from "react"
import Head from "next/head"
import { AppProps } from "next/app"
import { getSession, Provider as SessionProvider } from "next-auth/client"
import { DefaultSeo } from "next-seo"
import { SWRConfig } from "swr"
import { ThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

import { defaultSeoConfig, fire } from "@/constants"
import fetcher from "@/utils/fetcher"
import theme from "@/theme"
import { isBrowser } from "@/utils/is-browser"
import "../nprogress.css"
import useWebsocket from "@/hooks/use-websocket"
import { Emitter } from "@/lib/ws/socket-emitter"
import { EventHandler } from "@/lib/ws/event-handler"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

export const emitter = new Emitter()

function MyApp(props: AppProps) {
  const { Component, pageProps } = props

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side")
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, [])

  const [handler] = useWebsocket(fire.websiteSocketUrl, emitter)
  if (handler) {
    initHandler(handler)
  }

  return (
    <>
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
          </SessionProvider>
        </SWRConfig>
      </ThemeProvider>
    </>
  )
}

const initHandler = async (handler: EventHandler) => {
  if (!handler.session) {
    const session = await getSession()
    if (session) handler.session = session
  }
  const events = ["SUBSCRIBE", "HELLO"]
  for (const event of events) emitter.removeAllListeners(event)
  emitter.on("SUBSCRIBE", (route) => {
    handler.handleSubscribe(route)
  })
  emitter.on("HELLO", ({ interval }) => {
    handler.setHeartbeat(interval)
  })
  if (!handler.identified) handler.identify()
}

export default MyApp
