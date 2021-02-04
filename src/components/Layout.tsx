import * as React from 'react'
import NavBar from "./NavBar"

type Props = {
  children?: React.ReactNode
}

const Layout = ({ children }: Props) => (
  <>
    <NavBar/>
    {children}
  </>
)

export default Layout
