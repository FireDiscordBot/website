import Box from "@mui/material/Box"
import { NextSeo, NextSeoProps } from "next-seo"

import Footer from "@/components/layout/Footer"
import NavBar from "@/components/layout/NavBar"

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
