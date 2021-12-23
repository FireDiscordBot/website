import * as React from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import Grid from "@mui/material/Grid"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { styled } from "@mui/material/styles"

import { handler } from "../_app"

import SuperuserLayout, { SuperuserPageTypes } from "@/layouts/superuser-page"
import useSession from "@/hooks/use-session"
import Loading from "@/components/loading"

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 180,
}))

const snowflakeRegex = /\d{15,21}/

const AdminPage = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const [experiment, setExperiment] = React.useState<string>("")
  const [experimentType, setExperimentType] = React.useState<string>("")
  const [applyToID, setID] = React.useState<string>("")
  const [bucket, setBucket] = React.useState<number>(0)

  const handleExperimentChange = (event: SelectChangeEvent) => {
    setExperiment(event.target.value as string)
  }

  const handleExperimentTypeChange = (event: SelectChangeEvent) => {
    if (experiment && handler?.experiments.find((e) => e.id == experiment)?.kind != event.target.value)
      setExperiment("")
    setExperimentType(event.target.value as string)
  }

  const handleBucketChange = (event: SelectChangeEvent) => {
    setBucket(parseInt(event.target.value))
  }

  const handleApplyToIDChange = (value: string) => {
    if (snowflakeRegex.test(value)) setID(value)
  }

  if (!session || loading) {
    return <Loading />
  }

  return (
    <SuperuserLayout type={SuperuserPageTypes.USER} title="Admin" noindex nofollow>
      <Grid container style={{ marginBottom: 10 }}>
        <Grid item>
          <Grid container>
            <Grid item>
              <Typography variant="h4">Experiments</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid>
        <Grid item>
          <Typography variant="h6">Apply Experiment</Typography>
          <StyledFormControl>
            <InputLabel id="experiment-kind-select-label">Experiment Kind</InputLabel>
            <Select
              labelId="experiment-kind-select-label"
              id="experiment-kind-select-label"
              value={experimentType}
              onChange={handleExperimentTypeChange}
              required
            >
              <MenuItem key="guild" value="guild">
                Guild
              </MenuItem>
              <MenuItem key="user" value="user">
                User
              </MenuItem>
            </Select>
          </StyledFormControl>
          <StyledFormControl>
            <InputLabel id="experiment-list-select-label">Experiment Name</InputLabel>
            <Select
              labelId="experiment-list-select-label"
              id="experiment-list-select-label"
              value={experiment}
              onChange={handleExperimentChange}
              required
            >
              {handler?.experiments
                .filter((exp) => exp.kind == experimentType)
                .map((exp) => (
                  <MenuItem key={exp.id} value={exp.id}>
                    {exp.label}
                  </MenuItem>
                ))}
            </Select>
          </StyledFormControl>
          <StyledFormControl>
            <InputLabel id="experiment-bucket-select-label">Treatment</InputLabel>
            <Select
              labelId="experiment-bucket-select-label"
              id="experiment-bucket-select-label"
              value={bucket.toString()}
              onChange={handleBucketChange}
              disabled={experiment ? false : true}
              required
            >
              {handler?.experiments
                .find((exp) => exp.id == experiment)
                ?.treatments.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
            </Select>
          </StyledFormControl>
          <StyledFormControl>
            <Box mb={2}>
              <TextField
                id="apply-to-id"
                onChange={(value) => handleApplyToIDChange(value.target.value)}
                fullWidth
                required
                label={experimentType == "guild" ? "Guild ID" : "User ID"}
              />
            </Box>
          </StyledFormControl>
          <Box mb={2}>
            <Button
              variant={"outlined"}
              onClick={() => {
                if (!experiment)
                  handler?.emitter.emit("NOTIFICATION", {
                    text: "You must select an experiment",
                    severity: "error",
                    horizontal: "right",
                    vertical: "top",
                    autoHideDuration: 3000,
                  })
                else if (
                  typeof bucket != "number" ||
                  !handler?.experiments.find((e) => e.id == experiment)?.treatments.find((t) => t.id == bucket)
                )
                  handler?.emitter.emit("NOTIFICATION", {
                    text: "You must select a valid treatment",
                    severity: "error",
                    horizontal: "right",
                    vertical: "top",
                    autoHideDuration: 3000,
                  })
                else if (!applyToID)
                  handler?.emitter.emit("NOTIFICATION", {
                    text: `You must input a valid ${experimentType} id`,
                    severity: "error",
                    horizontal: "right",
                    vertical: "top",
                    autoHideDuration: 3000,
                  })
                else if (handler) {
                  handler.applyExperiment(experiment, applyToID, bucket)
                  setExperiment("")
                  setExperimentType("")
                  setID("")
                  setBucket(0)
                  if (typeof document != "undefined" && !!document.getElementById("apply-to-id"))
                    // @ts-ignore
                    document.getElementById("apply-to-id").value = ""
                }
              }}
            >
              Submit
            </Button>
          </Box>
        </Grid>
      </Grid>
    </SuperuserLayout>
  )
}

export default AdminPage
