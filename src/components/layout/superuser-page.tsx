import { NextSeoProps } from "next-seo"
import { useState } from "react"

import DefaultLayout from "./default"
import UserPageLayout from "./user-page"

import Loading from "@/components/loading"
import { emitter, handler } from "@/pages/_app"

export enum SuperuserPageTypes {
  DEFAULT,
  USER,
}

type Props = NextSeoProps & {
  children?: React.ReactNode
  type: 1 | 2
}

const SuperuserLayout = ({ children, type, ...restProps }: Props) => {
  const [superuser, setSuperuser] = useState<boolean | null>(
    handler?.config ? (handler.config["utils.superuser"] as boolean) || false : null,
  )

  emitter.removeAllListeners("IDENTIFY_CLIENT")
  emitter.removeAllListeners("RESUME_CLIENT")
  emitter.removeAllListeners("CONFIG_UPDATE")
  emitter.on("IDENTIFY_CLIENT", (identify) => {
    if (!identify) return
    if (identify.config) setSuperuser((identify.config["utils.superuser"] as boolean) || false)
    else setSuperuser(false)
  })
  emitter.on("RESUME_CLIENT", (resume) => {
    if (resume?.config) setSuperuser((resume.config["utils.superuser"] as boolean) || false)
    else setSuperuser(false)
  })
  emitter.on("CONFIG_UPDATE", (config) => {
    if (config.name == "utils.superuser") setSuperuser(config.value == true)
  })

  if (superuser)
    return type == 1 ? (
      <UserPageLayout {...restProps}>{children}</UserPageLayout>
    ) : (
      <DefaultLayout {...restProps}>{children}</DefaultLayout>
    )
  else if (superuser == null) return <Loading></Loading>
  else {
    try {
      handler.router?.push("/")
    } catch {
      return <Loading></Loading>
    }
  }

  return <DefaultLayout {...restProps}></DefaultLayout>
}

export default SuperuserLayout
