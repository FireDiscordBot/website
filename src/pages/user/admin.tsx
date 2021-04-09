import * as React from "react"

import SuperuserLayout, { SuperuserPageTypes } from "@/layouts/superuser-page"

const AdminPage = () => {
  return (
    <SuperuserLayout type={SuperuserPageTypes.USER} title="Admin" noindex nofollow>
      this may be used for something in the future but for now it is just a placeholder
    </SuperuserLayout>
  )
}

export default AdminPage
