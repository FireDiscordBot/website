import * as React from "react"
import {
  Box,
  Button,
  createStyles,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core"

import { handler } from "../_app"

import SuperuserLayout, { SuperuserPageTypes } from "@/layouts/superuser-page"
import useSession from "@/hooks/use-session"
import Loading from "@/components/loading"

const useStyles = makeStyles((theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 180,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
)

const snowflakeRegex = /\d{15,21}/

const AdminPage = () => {
  const classes = useStyles()
  const [session, loading] = useSession({ redirectTo: "/" })
  const [experiment, setExperiment] = React.useState("")
  const [experimentType, setExperimentType] = React.useState("")
  const [applyToID, setID] = React.useState("")
  const [bucket, setBucket] = React.useState(0)

  const handleExperimentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setExperiment(event.target.value as string)
  }

  const handleExperimentTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (experiment && handler?.experiments.find((e) => e.id == experiment)?.kind != event.target.value)
      setExperiment("")
    setExperimentType(event.target.value as string)
  }

  const handleBucketChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setBucket(event.target.value as number)
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
          <FormControl className={classes.formControl}>
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
          </FormControl>
          <FormControl className={classes.formControl}>
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
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel id="experiment-bucket-select-label">Treatment</InputLabel>
            <Select
              labelId="experiment-bucket-select-label"
              id="experiment-bucket-select-label"
              value={bucket}
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
          </FormControl>
          <FormControl className={classes.formControl}>
            <Box mb={2}>
              <TextField
                id="apply-to-id"
                onChange={(value) => handleApplyToIDChange(value.target.value)}
                fullWidth
                required
                label={experimentType == "guild" ? "Guild ID" : "User ID"}
              />
            </Box>
          </FormControl>
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
                else if (!bucket)
                  handler?.emitter.emit("NOTIFICATION", {
                    text: "You must select a treatment",
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
