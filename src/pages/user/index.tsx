import * as React from "react"

import { handler } from "../_app"

import Loading from "@/components/loading"

const UserIndexPage = () => {
  try {
    handler.router?.push("/user/account")
    return null
  } catch {
    return <Loading></Loading>
  }
}

export default UserIndexPage
