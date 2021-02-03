import * as React from 'react'
import Head from 'next/head'
import {AppProps} from 'next/app'
import {Provider} from 'next-auth/client'
import {ThemeProvider} from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from '../src/theme'

function MyApp(props: AppProps) {
  const {Component, pageProps} = props

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side")
    jssStyles?.parentElement?.removeChild(jssStyles)
  }, [])

  return (
    <>
      <Head>
        <title>Fire</title>
        <meta name="viewport" content="initial-scale=1, width=device-width"/>
      </Head>
      <ThemeProvider theme={theme}>
        <Provider session={pageProps.session}>
          <CssBaseline/>
          <Component {...pageProps} />
        </Provider>
      </ThemeProvider>
    </>
  )
}

export default MyApp