import * as React from "react"
import Head from "next/head"
import { AppProps } from "next/app"
import { Provider as SessionProvider } from "next-auth/client"
import { DefaultSeo } from "next-seo"
import { SWRConfig } from "swr"
import { ThemeProvider } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"

import { defaultSeoConfig } from "@/constants"
import fetcher from "@/utils/fetcher"
import theme from "@/theme"
import { isBrowser } from "@/utils/is-browser"

import "../nprogress.css"

if (isBrowser()) {
  import("@/utils/load-nprogress")
}

function MyApp(props: AppProps) {
  const { Component, pageProps } = props

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side")
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, [])

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

export default MyApp
