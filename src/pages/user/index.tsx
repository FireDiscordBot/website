import * as React from "react"
import Router from "next/router"

import Loading from "@/components/loading"

const UserIndexPage = () => {
  try {
    Router.push("/user/account")
    return null
  } catch {
    return <Loading></Loading>
  }
}

export default UserIndexPage
