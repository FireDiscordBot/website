import { CacheProvider, EmotionCache } from "@emotion/react"
import AdapterDayjs from "@mui/lab/AdapterDayjs"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { SessionProvider } from "next-auth/react"
import { DefaultSeo } from "next-seo"
import type { AppProps } from "next/app"
import Head from "next/head"
import { SWRConfig } from "swr"

import { AetherProvider } from "@/components/providers/AetherProvider"
import { AppSnackbarProvider } from "@/components/providers/AppSnackbarProvider"
import AppSnackbar from "@/components/ui/AppSnackbar"
import { defaultSeoConfig } from "@/constants"
import theme from "@/theme"
import createEmotionCache from "@/utils/createEmotionCache"
import fetcher from "@/utils/fetcher"
import { isBrowser } from "@/utils/is-browser"

import "../nprogress.css"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

if (isBrowser() && process.env.NODE_ENV === "production") {
  console.log(
    `%c STOP!

%cUNLESS YOU KNOW WHAT YOU'RE DOING, DO NOT COPY/PASTE ANYTHING IN HERE!
DOING SO COULD REVEAL SENSITIVE INFORMATION SUCH AS YOUR EMAIL OR ACCESS TOKEN

IT'S BEST TO JUST CLOSE THIS WINDOW AND PRETEND IT DOES NOT EXIST.`,
    "background: #C95D63; color: white; font-size: xxx-large; border-radius: 8px 8px 8px 8px;",
    "background: #353A47; color: white; font-size: medium; border-radius: 0 0 0 0",
  )
}

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
                <AppSnackbarProvider>
                  <AetherProvider>
                    <CssBaseline />
                    <Component {...pageProps} />
                    <AppSnackbar />
                  </AetherProvider>
                </AppSnackbarProvider>
              </SessionProvider>
            </LocalizationProvider>
          </SWRConfig>
        </ThemeProvider>
      </CacheProvider>
    </>
  )
}

export default FireApp
