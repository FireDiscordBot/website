import * as React from "react"
import { Button, Card, CardContent, Grid, Typography } from "@material-ui/core"
import useSWR from "swr"

import SuperuserLayout, { SuperuserPageTypes } from "@/layouts/superuser-page"
import { BuildOverride } from "@/interfaces/aether"
import useSession from "@/hooks/use-session"
import Loading from "@/components/loading"
import { fire } from "@/constants"

const AdminPage = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const { data: buildOverrides, error: buildOverridesError } = useSWR<BuildOverride[]>(
    session ? "/api/admin/overrides" : null,
    {
      revalidateOnFocus: true,
    },
  )

  if (!session || loading || (!buildOverridesError && !buildOverrides)) {
    return <Loading />
  }

  return (
    <SuperuserLayout type={SuperuserPageTypes.USER} title="Admin" noindex nofollow>
      <Grid container style={{ marginBottom: 10 }}>
        <Grid item>
          <Grid container>
            <Grid item>
              <Typography variant="h4">Build Overrides</Typography>
            </Grid>
            {/* TODO move button over to the right somehow */}
            <Grid item style={{ display: "flex", flexDirection: "row-reverse" }}>
              <Button
                variant={"outlined"}
                onClick={() => {
                  return /* TODO make this open a modal */
                }}
              >
                Generate Build Override
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid>
        {(buildOverrides || []).map((override) => {
          return (
            <Card key={override.id}>
              <CardContent>
                <h3
                  onClick={() => {
                    window.open(
                      process.env.NODE_ENV == "development"
                        ? `${fire.aetherApiUrl}/__development/link?s=${override.hash}`
                        : `https://inv.wtf/__development/link?s=${override.hash}`,
                      "_blank",
                    )
                  }}
                  style={{ cursor: "pointer", display: "inline", wordWrap: "break-word" }}
                >
                  {override.hash}
                </h3>
                <Grid container spacing={2}>
                  <Grid item>
                    <h5>Override ID</h5>
                    {override.id}
                  </Grid>

                  <Grid item>
                    <h5>Experiment ID</h5>
                    {override.experiment}
                  </Grid>

                  <Grid item>
                    <h5>Treatment ID</h5>
                    {override.treatment}
                  </Grid>

                  {override.validForUserIds?.length && (
                    <Grid item>
                      <h5>Valid For User IDs</h5>
                      {override.validForUserIds.join(", ")}
                    </Grid>
                  )}

                  {override.expiresAt && (
                    <Grid item>
                      <h5>Expires At</h5>
                      {new Date(override.expiresAt).toLocaleString()}
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )
        })}
      </Grid>
    </SuperuserLayout>
  )
}

export default AdminPage
