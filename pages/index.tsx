import React from "react"
import {useSession} from 'next-auth/client'
import Layout from '../src/components/Layout'

const Index = () => {
  const [session] = useSession()

  return (
    <Layout>
      {!session && <>
        Not signed in
      </>}
      {session && <>
        Signed in as {session.user.name}#{session.user.discriminator}<br/>
      </>}
    </Layout>
  )
}

export default Index
