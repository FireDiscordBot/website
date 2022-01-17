import { TextField } from "@mui/material"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Tab from "@mui/material/Tab"
import Tabs, { TabsProps, tabsClasses } from "@mui/material/Tabs"
import { red } from "@mui/material/colors"
import { Theme, styled } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useRouter } from "next/router"
import { ChangeEvent, useEffect, useState } from "react"

import DefaultLayout from "@/components/layout/default"
import { fire } from "@/constants"
import { Command } from "@/interfaces/aether"

interface CategoriesTabsProps extends TabsProps {
  isMobile: boolean
}

const CategoriesTabs = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== "isMobile",
})<CategoriesTabsProps>(({ isMobile, theme }) => ({
  [`& .${tabsClasses.indicator}`]: {
    backgroundColor: red[700],
  },
  ...(!isMobile && {
    borderRight: `1px solid ${theme.palette.divider}`,
  }),
}))

const CommandsPage = () => {
  const router = useRouter()

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [prefix, setPrefix] = useState(fire.defaultPrefix)
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0)
  const [preFilterCategoryIndex, setPreFilterCategoryIndex] = useState<number>(0)
  const [commands] = useState<Command[]>(
    // TODO
    // handler?.commands
    //   ? handler.commands.filter((c) => c.category == handler.commandCategories[selectedCategoryIndex])
    //   :
    [],
  )
  const [filter, setFilter] = useState<string>("")
  const [filterTimeout] = useState<NodeJS.Timeout | null>(null)
  const [cachedCategories] = useState<string[]>([])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getCategories = (): string[] => {
    // TODO
    // if (!handler)
    return []
    // const categories = filter
    //   ? [
    //       "All",
    //       ...handler.commandCategories.filter((cat) =>
    //         handler.commands.find((c) => c.category == cat && c.name.includes(filter)),
    //       ),
    //     ]
    //   : handler.commandCategories
    // if (categories.length == 2 && categories[0] == "All") return categories.slice(1)
    // return categories
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCommandsList = (_category: string) => {
    // TODO
    // setCommandsState(
    //   filter
    //     ? category == "All"
    //       ? handler.commands.filter((c) => c.name.includes(filter))
    //       : handler.commands.filter((c) => c.category == category && c.name.includes(filter))
    //     : handler.commands.filter((c) => c.category == category),
    // )
  }

  const onChangeSelectedTab = (event: ChangeEvent<unknown>) => {
    const categoryName = (event.target as HTMLSpanElement).textContent
    if (!categoryName) return
    const index = getCategories().indexOf(categoryName)
    setSelectedCategoryIndex(index)
    // TODO
    // if (!cachedCategories.includes(categoryName) && categoryName != "All")
    //   handler.handleSubscribe("/commands", {
    //     category: categoryName,
    //   })
    // if (handler) updateCommandsList(categoryName)
  }

  const handleTextChange = (f: string) => {
    if (!f) {
      setSelectedCategoryIndex(preFilterCategoryIndex)
      setPreFilterCategoryIndex(0)
    }
    setFilter(f)
    if (!filter) {
      setPreFilterCategoryIndex(selectedCategoryIndex)
      setSelectedCategoryIndex(0)
    }
    if (filterTimeout) clearTimeout(filterTimeout)
    // TODO
    // if (handler) {
    //   if (filter) setFilterTimeout(setTimeout(() => handler.handleSubscribe("/commands", { filter }), 250))
    //   updateCommandsList(getCategories()[selectedCategoryIndex])
    // }
  }

  useEffect(() => {
    // TODO
    // const setCommands = (commands: Command[]) => {
    // if (!handler) return
    // handler.commands = [...handler.commands, ...commands]
    // // remove duplicates
    // handler.commands = handler.commands.filter(
    //   (c, index) => handler.commands.findIndex((c2) => c2.name === c.name) === index,
    // )
    // updateCommandsList(getCategories()[selectedCategoryIndex])
    // }
    // emitter.removeAllListeners("COMMANDS_UPDATE")
    // emitter.on("COMMANDS_UPDATE", (update) => {
    //   setCommands(update.commands)
    //   if (update.full && update.commands[0].category && !cachedCategories.includes(update.commands[0].category))
    //     setCachedCategories([...cachedCategories, update.commands[0].category])
    // })
  }, [cachedCategories, commands, filter, getCategories, selectedCategoryIndex, updateCommandsList])

  useEffect(() => {
    if (typeof router.query.prefix === "string") {
      setPrefix(router.query.prefix)
    }
    if (typeof router.query.category === "string") {
      const categoryIndex = parseInt(router.query.category, 10)
      setSelectedCategoryIndex(categoryIndex)
    }
  }, [router.query, commands])

  return (
    <DefaultLayout title="Commands">
      <Container>
        <Grid container>
          <TextField
            id="command-filter"
            onChange={(value) => handleTextChange(value.target.value)}
            fullWidth
            placeholder={"Search Commands"}
          />
          <Grid item xs={12} md={12}>
            <Paper sx={{ height: "100%" }}>
              <CategoriesTabs
                orientation={"horizontal"}
                variant="scrollable"
                value={selectedCategoryIndex}
                onChange={onChangeSelectedTab}
                isMobile={isMobile}
              >
                {getCategories().map((category, index) => (
                  <Tab label={category} key={index} />
                ))}
              </CategoriesTabs>
            </Paper>
          </Grid>
          <Grid item xs={12} md={12}>
            <Box paddingTop={3} width="100%" key={0}>
              {/* {handler?.commandCategories?.length && commands.length ? (
                // TODO: put subcommands inside the main command's CommandAccordion
                commands
                  .filter((command) => !!command.description)
                  .map((command, index) => <CommandAccordion command={command} prefix={prefix} key={index} />)
              ) : (
                <Loading />
              )} */}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </DefaultLayout>
  )
}

export default CommandsPage
