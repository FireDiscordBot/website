import { CacheProvider, EmotionCache } from "@emotion/react"
import AdapterDayjs from "@mui/lab/AdapterDayjs"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { SessionProvider } from "next-auth/react"
import { DefaultSeo } from "next-seo"
import { AppProps } from "next/app"
import Head from "next/head"
import { SWRConfig } from "swr"

import { defaultSeoConfig } from "@/constants"
import { AetherClient } from "@/lib/ws/aether-client"
import { Emitter } from "@/lib/ws/socket-emitter"
import theme from "@/theme"
import createEmotionCache from "@/utils/createEmotionCache"
import fetcher from "@/utils/fetcher"
import { isBrowser } from "@/utils/is-browser"

import "../nprogress.css"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

export const emitter = new Emitter()
export let handler: AetherClient

const clientSideEmotionCache = createEmotionCache()

interface FireAppProps extends AppProps {
  emotionCache?: EmotionCache
}

function FireApp(props: FireAppProps) {
  const { Component, pageProps, emotionCache = clientSideEmotionCache } = props

  return (
    <>
      <Head>
        <title>Fire</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <DefaultSeo {...defaultSeoConfig} />
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <SWRConfig value={{ fetcher: fetcher }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <SessionProvider session={pageProps.session}>
                <CssBaseline />
                <Component {...pageProps} />
              </SessionProvider>
            </LocalizationProvider>
          </SWRConfig>
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}

export default FireApp
