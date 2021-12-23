import { NextSeo, NextSeoProps } from "next-seo"
import * as React from "react"
import Box from "@mui/material/Box"

import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

type Props = NextSeoProps & {
  children?: React.ReactNode
}

const DefaultLayout = ({ children, ...restProps }: Props) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NextSeo {...restProps} />
      <NavBar />
      <Box pb={4}>{children}</Box>
      <Footer />
    </Box>
  )
}

export default DefaultLayout
