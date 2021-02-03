import React, { ReactNode } from 'react'
import NavBar from "./NavBar"

type Props = {
  children?: ReactNode
}

const Layout = ({ children }: Props) => (
  <>
    <NavBar/>
    {children}
  </>
)

export default Layout
