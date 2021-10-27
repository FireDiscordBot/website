import * as React from "react"
import clsx from "clsx"
import { useRouter } from "next/router"
import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Box from "@material-ui/core/Box"
import Grid from "@material-ui/core/Grid"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import { withStyles } from "@material-ui/core"
import { red } from "@material-ui/core/colors"

import { emitter, handler } from "./_app"

import { fire } from "@/constants"
import { Command } from "@/interfaces/aether"
import DefaultLayout from "@/layouts/default"
import CommandAccordion from "@/components/CommandAccordion"
import Loading from "@/components/loading"

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      display: "flex",
    },
    fullHeight: {
      height: "100%",
    },
    borderRight: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  }),
)

const CategoriesTabs = withStyles({
  indicator: {
    backgroundColor: red[700],
  },
})(Tabs)

const CommandsPage = () => {
  const classes = useStyles()
  const router = useRouter()

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"))
  const [prefix, setPrefix] = React.useState(fire.defaultPrefix)
  const [selectedCategoryIndex, setSelectedCategoryIndex] = React.useState<number>(0)
  const [commands, setCommandsState] = React.useState<Command[]>(
    handler?.commands
      ? handler.commands.filter((c) => c.category == handler.commandCategories[selectedCategoryIndex])
      : [],
  )

  const onChangeSelectedTab = (_event: React.ChangeEvent<unknown>, index: number) => {
    setSelectedCategoryIndex(index)
    if (!handler?.commands.find((c) => c.category === handler?.commandCategories[index]))
      handler.handleSubscribe("/commands", {
        category: handler.commandCategories[index],
      })
    else if (handler) setCommandsState(handler.commands.filter((c) => c.category == handler.commandCategories[index]))
  }

  React.useEffect(() => {
    const setCommands = (commands: Command[]) => {
      if (handler) handler.commands = [...handler.commands, ...commands]
      setCommandsState(commands.filter((c) => c.category == handler.commandCategories[selectedCategoryIndex]))
    }

    emitter.removeAllListeners("COMMANDS_UPDATE")
    emitter.on("COMMANDS_UPDATE", (update) => {
      setCommands(update.commands)
    })
  }, [commands, selectedCategoryIndex])

  React.useEffect(() => {
    if (typeof router.query.prefix === "string") {
      setPrefix(router.query.prefix)
    }
    if (typeof router.query.category === "string") {
      const categoryIndex = parseInt(router.query.category, 10)
      setSelectedCategoryIndex(categoryIndex)
    }
  }, [router.query, commands])

  if (!handler?.commandCategories?.length) return <Loading />

  return (
    <DefaultLayout title="Commands">
      <Container>
        <Grid container>
          <Grid item xs={12} md={12}>
            <Paper className={classes.fullHeight}>
              <CategoriesTabs
                orientation={"horizontal"}
                variant="scrollable"
                value={selectedCategoryIndex}
                onChange={onChangeSelectedTab}
                className={clsx(classes.fullHeight, {
                  [classes.borderRight]: !isMobile,
                })}
              >
                {handler.commandCategories.map((category, index) => (
                  <Tab label={category} key={index} />
                ))}
              </CategoriesTabs>
            </Paper>
          </Grid>
          <Grid item xs={12} md={12}>
            <Box paddingTop={3} width="100%" key={0}>
              {commands.length ? (
                commands.map((command, index) => <CommandAccordion command={command} prefix={prefix} key={index} />)
              ) : (
                <Loading />
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </DefaultLayout>
  )
}

export default CommandsPage
